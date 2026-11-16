using DealsSeeker.Api.Caching;
using DealsSeeker.Api.Endpoints;
using DealsSeeker.Api.Logging;
using DealsSeeker.Api.Maintenance;
using DealsSeeker.Api.Options;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Api.Responses;
using DealsSeeker.Api.Security;
using DealsSeeker.Api.Services.Auth;
using DealsSeeker.Api.Services.Comments;
using DealsSeeker.Api.Services.Feedback;
using DealsSeeker.Api.Services.Locations;
using DealsSeeker.Api.Services.Offers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using System.Globalization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

var corsAllowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                         ?? (builder.Environment.IsDevelopment()
                             ? ["http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:19006", "http://127.0.0.1:19006"]
                             : []);

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------
SqliteLogEventSink? sqliteLogSink = null;
ILoggerFactory? logSinkLoggerFactory = null;

builder.Host.UseSerilog((context, _, loggerConfiguration) =>
{
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext();

    var databaseConnectionString = context.Configuration.GetSection(DatabaseOptions.SectionName)["ConnectionString"]
                             ?? "Data Source=Data/dealseeker.db";
    var loggingPersistence = context.Configuration.GetSection(LoggingPersistenceOptions.SectionName).Get<LoggingPersistenceOptions>()
                             ?? new LoggingPersistenceOptions();

    if (loggingPersistence.EnableDatabaseSink)
    {
        // The sink writes to its own database file and buffers events on a background writer, so
        // the request thread never performs database I/O for logging.
        logSinkLoggerFactory = LoggerFactory.Create(logging => logging
            .AddSimpleConsole()
            .SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Warning));

        sqliteLogSink = new SqliteLogEventSink(
            loggingPersistence.ConnectionString,
            context.HostingEnvironment.ContentRootPath,
            loggingPersistence,
            logSinkLoggerFactory.CreateLogger<SqliteLogEventSink>());

        loggerConfiguration.WriteTo.Sink(
            sqliteLogSink,
            restrictedToMinimumLevel: loggingPersistence.ResolveMinimumLevel());
    }
});

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DealsSeekerFrontend", policy =>
    {
        if (corsAllowedOrigins.Length == 0)
        {
            return;
        }

        policy
            .WithOrigins(corsAllowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection(DatabaseOptions.SectionName));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));
builder.Services.Configure<LoggingPersistenceOptions>(builder.Configuration.GetSection(LoggingPersistenceOptions.SectionName));
builder.Services.Configure<MapsOptions>(builder.Configuration.GetSection(MapsOptions.SectionName));
builder.Services.Configure<GoogleMapsOptions>(builder.Configuration.GetSection(GoogleMapsOptions.SectionName));
builder.Services.Configure<OpenLayersOptions>(builder.Configuration.GetSection(OpenLayersOptions.SectionName));
builder.Services.Configure<MapProviderResilienceOptions>(builder.Configuration.GetSection(MapProviderResilienceOptions.SectionName));

builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
builder.Services.AddSingleton<ISessionCache, MemorySessionCache>();
builder.Services.AddScoped<ConditionalResponseService>();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Services.AddSingleton<SqliteConnectionFactory>();
builder.Services.AddSingleton<IDbConnectionFactory>(serviceProvider => serviceProvider.GetRequiredService<SqliteConnectionFactory>());
builder.Services.AddSingleton<IDatabaseMigrationRunner, SqliteMigrationRunner>();
builder.Services.AddHostedService<DatabaseJanitor>();

builder.Services.AddScoped<IAuthService, DapperAuthService>();
builder.Services.AddScoped<IOfferService, DapperOfferService>();
builder.Services.AddScoped<IFeedbackService, DapperFeedbackService>();
builder.Services.AddScoped<ICommentService, DapperCommentService>();

builder.Services.AddAuthentication(BearerTokenAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, BearerTokenAuthenticationHandler>(
        BearerTokenAuthenticationHandler.SchemeName,
        _ => { });
builder.Services.AddAuthorization();

// ---------------------------------------------------------------------------
// External map providers: timeout, retry, circuit breaker and outbound rate limiting
// ---------------------------------------------------------------------------
var mapResilience = builder.Configuration.GetSection(MapProviderResilienceOptions.SectionName)
    .Get<MapProviderResilienceOptions>() ?? new MapProviderResilienceOptions();

builder.Services
    .AddHttpClient<GoogleMapsLocationLookupService>(client =>
        client.Timeout = TimeSpan.FromSeconds(mapResilience.TimeoutSeconds))
    .AddStandardResilienceHandler(options =>
    {
        options.Retry.MaxRetryAttempts = mapResilience.RetryCount;
        options.Retry.Delay = TimeSpan.FromMilliseconds(200);
        options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(mapResilience.TimeoutSeconds);
        options.TotalRequestTimeout.Timeout =
            TimeSpan.FromSeconds(mapResilience.TimeoutSeconds * (mapResilience.RetryCount + 1));
        options.CircuitBreaker.FailureRatio = 0.5;
        options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
        options.CircuitBreaker.BreakDuration = TimeSpan.FromSeconds(mapResilience.CircuitBreakerSeconds);
    });

builder.Services
    .AddHttpClient<OpenLayersLocationLookupService>(client =>
        client.Timeout = TimeSpan.FromSeconds(mapResilience.TimeoutSeconds))
    .AddStandardResilienceHandler(options =>
    {
        options.Retry.MaxRetryAttempts = mapResilience.RetryCount;
        options.Retry.Delay = TimeSpan.FromMilliseconds(200);
        options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(mapResilience.TimeoutSeconds);
        options.TotalRequestTimeout.Timeout =
            TimeSpan.FromSeconds(mapResilience.TimeoutSeconds * (mapResilience.RetryCount + 1));
        options.CircuitBreaker.FailureRatio = 0.5;
        options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
        options.CircuitBreaker.BreakDuration = TimeSpan.FromSeconds(mapResilience.CircuitBreakerSeconds);
    });

builder.Services.AddTransient<ILocationLookupProvider>(serviceProvider => serviceProvider.GetRequiredService<GoogleMapsLocationLookupService>());
builder.Services.AddTransient<ILocationLookupProvider>(serviceProvider => serviceProvider.GetRequiredService<OpenLayersLocationLookupService>());
builder.Services.AddScoped<ILocationLookupService, ConfigurableLocationLookupService>();

// ---------------------------------------------------------------------------
// Request protection, transport efficiency and observability
// ---------------------------------------------------------------------------
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 300,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("user", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? context.Connection.RemoteIpAddress?.ToString()
                ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 600,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("search", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("location", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.OnRejected = async (context, cancellationToken) =>
    {
        var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfterValue)
            ? retryAfterValue
            : TimeSpan.FromMinutes(1);

        context.HttpContext.Response.Headers.RetryAfter =
            ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString(CultureInfo.InvariantCulture);

        await DealsSeeker.Api.Responses.ApiResults
            .RateLimited(retryAfter)
            .ExecuteAsync(context.HttpContext);
    };
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes;
});

builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy("The API is running."), tags: ["live"]);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("dealseeker-api"))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddMeter("DealsSeeker.Api.Cache")
        .AddMeter("DealsSeeker.Api.Search")
        .AddPrometheusExporter())
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation());

// The payload limit protects the API from oversized submissions, including embedded image data.
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 8 * 1024 * 1024;
});

if (sqliteLogSink is not null)
{
    builder.Services.AddSingleton(sqliteLogSink);
}

var app = builder.Build();

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
await using (var scope = app.Services.CreateAsyncScope())
{
    var connectionFactory = scope.ServiceProvider.GetRequiredService<SqliteConnectionFactory>();
    await connectionFactory.ApplyJournalModeAsync(CancellationToken.None);

    var migrationRunner = scope.ServiceProvider.GetRequiredService<IDatabaseMigrationRunner>();
    await migrationRunner.ApplyMigrationsAsync(CancellationToken.None);
}

var configuredConnectionString = app.Configuration.GetSection(DatabaseOptions.SectionName)["ConnectionString"]
                               ?? "Data Source=Data/dealseeker.db";
var resolvedDatabasePath = SqlitePathResolver.ResolveDataSourceFromConnectionString(configuredConnectionString, app.Environment.ContentRootPath);
if (!string.IsNullOrWhiteSpace(resolvedDatabasePath))
{
    app.Logger.LogInformation("SQLite database path: {DatabasePath}", resolvedDatabasePath);
}

app.Logger.LogInformation("DealsSeeker API startup completed.");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseResponseCompression();
app.UseStaticFiles();
app.UseCors("DealsSeekerFrontend");
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapHealthChecks("/health/live", new() { Predicate = _ => true });
app.MapPrometheusScrapingEndpoint("/metrics");
app.MapHealthChecks("/health/ready", new()
{
    Predicate = check => check.Tags.Contains("live"),
    ResponseWriter = static async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(entry => new { name = entry.Key, status = entry.Value.Status.ToString() })
        });
    }
});

app.MapDealsSeekerApi();

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
    logSinkLoggerFactory?.Dispose();
}
