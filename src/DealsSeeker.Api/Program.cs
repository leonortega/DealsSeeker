using DealsSeeker.Api.Options;
using DealsSeeker.Api.Logging;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Api.Services.Auth;
using DealsSeeker.Api.Services.Feedback;
using DealsSeeker.Api.Services.Locations;
using DealsSeeker.Api.Services.Offers;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using Microsoft.Data.Sqlite;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

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
        loggerConfiguration.WriteTo.Sink(
            new SqliteLogEventSink(databaseConnectionString, context.HostingEnvironment.ContentRootPath),
            restrictedToMinimumLevel: loggingPersistence.ResolveMinimumLevel());
    }
});

builder.Services.AddOpenApi();

builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection(DatabaseOptions.SectionName));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));
builder.Services.Configure<LoggingPersistenceOptions>(builder.Configuration.GetSection(LoggingPersistenceOptions.SectionName));
builder.Services.Configure<MapsOptions>(builder.Configuration.GetSection(MapsOptions.SectionName));
builder.Services.Configure<GoogleMapsOptions>(builder.Configuration.GetSection(GoogleMapsOptions.SectionName));
builder.Services.Configure<OpenLayersOptions>(builder.Configuration.GetSection(OpenLayersOptions.SectionName));

builder.Services.AddSingleton<IDbConnectionFactory, SqliteConnectionFactory>();
builder.Services.AddSingleton<IDatabaseMigrationRunner, SqliteMigrationRunner>();
builder.Services.AddScoped<IAuthService, DapperAuthService>();
builder.Services.AddScoped<IOfferService, DapperOfferService>();
builder.Services.AddScoped<IFeedbackService, DapperFeedbackService>();
builder.Services.AddHttpClient<GoogleMapsLocationLookupService>();
builder.Services.AddHttpClient<OpenLayersLocationLookupService>();
builder.Services.AddTransient<ILocationLookupProvider>(serviceProvider => serviceProvider.GetRequiredService<GoogleMapsLocationLookupService>());
builder.Services.AddTransient<ILocationLookupProvider>(serviceProvider => serviceProvider.GetRequiredService<OpenLayersLocationLookupService>());
builder.Services.AddScoped<ILocationLookupService, ConfigurableLocationLookupService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

await using (var scope = app.Services.CreateAsyncScope())
{
    var migrationRunner = scope.ServiceProvider.GetRequiredService<IDatabaseMigrationRunner>();
    await migrationRunner.ApplyMigrationsAsync(CancellationToken.None);
}

var configuredConnectionString = app.Configuration.GetSection(DatabaseOptions.SectionName)["ConnectionString"]
                               ?? "Data Source=Data/dealseeker.db";
var resolvedDatabasePath = ResolveSqliteDataSource(configuredConnectionString, app.Environment.ContentRootPath);
if (!string.IsNullOrWhiteSpace(resolvedDatabasePath))
{
    app.Logger.LogInformation("SQLite database path: {DatabasePath}", resolvedDatabasePath);
}

app.Logger.LogInformation("DealsSeeker API startup completed. Serilog sinks configured (file + database).");

app.UseHttpsRedirection();

var api = app.MapGroup("/api");

api.MapPost("/auth/register", async (RegisterUserRequest request, IAuthService auth, ILoggerFactory loggerFactory, CancellationToken cancellationToken) =>
    {
        loggerFactory.CreateLogger("DealsSeeker.Auth").LogInformation("Register request received for email {Email}", request.Email);
        var result = await auth.RegisterAsync(request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("RegisterUser")
    .WithSummary("ACCOUNT.AUTH.REGISTER.001: Create a new user account.");

api.MapPost("/auth/login", async (LoginRequest request, IAuthService auth, CancellationToken cancellationToken) =>
    {
        var session = await auth.LoginAsync(request, cancellationToken);
        return session is null ? Results.Unauthorized() : Results.Ok(session);
    })
    .WithName("LoginUser")
    .WithSummary("ACCOUNT.AUTH.LOGIN.001: Authenticate user and start session.");

api.MapPost("/auth/logout", async (HttpContext httpContext, IAuthService auth, CancellationToken cancellationToken) =>
    {
        if (!TryGetAccessToken(httpContext, out var accessToken))
        {
            return Results.Unauthorized();
        }

        var result = await auth.LogoutAsync(accessToken, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.Unauthorized();
    })
    .WithName("LogoutUser")
    .WithSummary("ACCOUNT.PROFILE.001: End authenticated session.");

api.MapGet("/account/me", async (HttpContext httpContext, IAuthService auth, CancellationToken cancellationToken) =>
    {
        if (!TryGetAccessToken(httpContext, out var accessToken))
        {
            return Results.Unauthorized();
        }

        var profile = await auth.GetProfileByTokenAsync(accessToken, cancellationToken);
        return profile is null ? Results.Unauthorized() : Results.Ok(profile);
    })
    .WithName("GetMyAccountProfile")
    .WithSummary("ACCOUNT.PROFILE.001: Get profile for authenticated user.");

api.MapPost("/offers/search", async (SearchOffersRequest request, HttpContext httpContext, IAuthService auth, IOfferService offers, CancellationToken cancellationToken) =>
    {
        if (!TryGetAccessToken(httpContext, out var accessToken))
        {
            return Results.Unauthorized();
        }

        var profile = await auth.GetProfileByTokenAsync(accessToken, cancellationToken);
        if (profile is null)
        {
            return Results.Unauthorized();
        }

        var response = await offers.SearchAsync(request, profile.UserId, cancellationToken);
        return Results.Ok(response);
    })
    .WithName("SearchOffers")
    .WithSummary("OFFERS.SEARCH.001 + OFFERS.SEARCH.SMART.001 + OFFERS.FAVORITES.001: Search offers with smart ranking and current-user state.");

api.MapPost("/offers/{offerId}/availability", async (string offerId, OfferAvailabilityVoteRequest request, HttpContext httpContext, IAuthService auth, IOfferService offers, CancellationToken cancellationToken) =>
    {
        if (!TryGetAccessToken(httpContext, out var accessToken))
        {
            return Results.Unauthorized();
        }

        var profile = await auth.GetProfileByTokenAsync(accessToken, cancellationToken);
        if (profile is null)
        {
            return Results.Unauthorized();
        }

        var result = await offers.VoteAvailabilityAsync(offerId, profile.UserId, request, cancellationToken);
        if (result.Success)
        {
            return Results.Ok(result);
        }

        return result.Message.StartsWith("Offer not found.", StringComparison.OrdinalIgnoreCase)
            ? Results.NotFound(result)
            : Results.BadRequest(result);
    })
    .WithName("VoteOfferAvailability")
    .WithSummary("OFFERS.LIST.ACTIONS.001: Register thumbs up/down availability feedback counters, one vote per user.");

api.MapPost("/offers/{offerId}/report", async (string offerId, ReportOfferRequest request, IOfferService offers, CancellationToken cancellationToken) =>
    {
        var result = await offers.ReportAsync(offerId, request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("ReportOffer")
    .WithSummary("OFFERS.LIST.ACTIONS.001: Report an offer.");

api.MapPost("/offers/{offerId}/favorite", async (string offerId, SetFavoriteRequest request, HttpContext httpContext, IAuthService auth, IOfferService offers, CancellationToken cancellationToken) =>
    {
        if (!TryGetAccessToken(httpContext, out var accessToken))
        {
            return Results.Unauthorized();
        }

        var profile = await auth.GetProfileByTokenAsync(accessToken, cancellationToken);
        if (profile is null)
        {
            return Results.Unauthorized();
        }

        var result = await offers.SetFavoriteAsync(offerId, profile.UserId, request, cancellationToken);
        if (result.Success)
        {
            return Results.Ok(result);
        }

        return result.Message.StartsWith("Offer not found.", StringComparison.OrdinalIgnoreCase)
            ? Results.NotFound(result)
            : Results.BadRequest(result);
    })
    .WithName("SetFavorite")
    .WithSummary("OFFERS.FAVORITES.001: Save or remove offer from user favorites.");

api.MapPost("/offers", async (AddOfferRequest request, IOfferService offers, CancellationToken cancellationToken) =>
    {
        var result = await offers.AddAsync(request, cancellationToken);
        return Results.Created($"/api/offers/{result.OfferId}", result);
    })
    .WithName("CreateOffer")
    .WithSummary("ADD.OFFER.*: Create a new offer from add-offer view inputs.");

api.MapGet("/locations/search", async (string query, ILocationLookupService lookup, CancellationToken cancellationToken) =>
    {
        var results = await lookup.SearchAsync(query, cancellationToken);
        return Results.Ok(results);
    })
    .WithName("SearchLocations")
    .WithSummary("ADD.OFFER.LOCATION.001 + APP.CONFIG.MAPS.001: Search business or address using configured map provider module.");

api.MapGet("/locations/reverse", async (double lat, double lng, ILocationLookupService lookup, CancellationToken cancellationToken) =>
    {
        var result = await lookup.ReverseAsync(new GeoPoint(lat, lng), cancellationToken);
        return result is null ? Results.NotFound() : Results.Ok(result);
    })
    .WithName("ReverseLocation")
    .WithSummary("ADD.OFFER.LOCATION.001: Resolve nearest human-readable address label from coordinates.");

api.MapPost("/suggestions", async (SuggestionRequest request, IFeedbackService feedback, CancellationToken cancellationToken) =>
    {
        var result = await feedback.SubmitSuggestionAsync(request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreateSuggestion")
    .WithSummary("App shell section: submit suggestion.");

api.MapPost("/reports", async (ReportRequest request, IFeedbackService feedback, CancellationToken cancellationToken) =>
    {
        var result = await feedback.SubmitReportAsync(request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreateReport")
    .WithSummary("App shell section: submit report.");

api.MapPost("/complaints", async (ReportRequest request, IFeedbackService feedback, CancellationToken cancellationToken) =>
    {
        var result = await feedback.SubmitReportAsync(request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreateComplaintAlias")
    .WithSummary("Backward-compatible alias for report submission.");

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}

static bool TryGetAccessToken(HttpContext httpContext, out string accessToken)
{
    const string bearerPrefix = "Bearer ";
    var authorizationHeader = httpContext.Request.Headers.Authorization.ToString();
    if (authorizationHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
    {
        accessToken = authorizationHeader[bearerPrefix.Length..].Trim();
        return !string.IsNullOrWhiteSpace(accessToken);
    }

    accessToken = string.Empty;
    return false;
}

static string ResolveSqliteDataSource(string connectionString, string contentRootPath)
{
    var builder = new SqliteConnectionStringBuilder(connectionString);
    if (string.IsNullOrWhiteSpace(builder.DataSource) ||
        builder.DataSource.Equals(":memory:", StringComparison.OrdinalIgnoreCase))
    {
        return builder.DataSource ?? string.Empty;
    }

    return Path.IsPathRooted(builder.DataSource)
        ? builder.DataSource
        : Path.GetFullPath(Path.Combine(contentRootPath, builder.DataSource));
}
