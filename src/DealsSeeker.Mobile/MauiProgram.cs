using DealsSeeker.Mobile.Services.Api;
using DealsSeeker.Mobile.Services.Auth;
using DealsSeeker.Mobile.Services.Device;
using DealsSeeker.Mobile.Services.Localization;
using DealsSeeker.Mobile.Services.Maps;
using DealsSeeker.Mobile.Services.Preferences;
using DealsSeeker.Mobile.Services.Reports;
using DealsSeeker.Mobile.Services.Ui;
using Microsoft.Maui.Storage;
using Microsoft.Extensions.Logging;
using Serilog;

namespace DealsSeeker.Mobile;

public static class MauiProgram
{
   public static MauiApp CreateMauiApp()
{
    try
    {
        CultureService.ApplyStartupCultureFromPreferences();

        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        builder.Services.AddMauiBlazorWebView();
        builder.Services.AddLocalization(options => options.ResourcesPath = "Resources/Localization");
        var defaultApiSettings = new ApiSettings();
        var apiConfiguration = builder.Configuration.GetSection("Api");
        builder.Services.AddSingleton(new ApiSettings
        {
            BaseUrl = apiConfiguration["BaseUrl"] ?? defaultApiSettings.BaseUrl,
            MapDisplayProvider = apiConfiguration["MapDisplayProvider"]
                                 ?? apiConfiguration["MapProvider"]
                                 ?? defaultApiSettings.MapDisplayProvider,
            MapDisplayProviderFallback = apiConfiguration["MapDisplayProviderFallback"]
                                         ?? apiConfiguration["MapProviderFallback"]
                                         ?? defaultApiSettings.MapDisplayProviderFallback,
            MapRedirectProvider = apiConfiguration["MapRedirectProvider"]
                                  ?? apiConfiguration["MapProvider"]
                                  ?? defaultApiSettings.MapRedirectProvider,
            MapRedirectProviderFallback = apiConfiguration["MapRedirectProviderFallback"]
                                          ?? apiConfiguration["MapProviderFallback"]
                                          ?? defaultApiSettings.MapRedirectProviderFallback
        });
        builder.Services.AddSingleton<IUserSessionService, UserSessionService>();
        builder.Services.AddSingleton<IDeviceLocationService, DeviceLocationService>();
        builder.Services.AddSingleton<IMapLauncherService, MapLauncherService>();
        builder.Services.AddSingleton<IMapRenderingService, MapRenderingService>();
        builder.Services.AddSingleton<IMediaCaptureService, MediaCaptureService>();
        builder.Services.AddSingleton<IReportDraftContext, ReportDraftContext>();
        builder.Services.AddSingleton<IViewBusyService, ViewBusyService>();
        builder.Services.AddSingleton<ICultureService, CultureService>();
        builder.Services.AddScoped<HttpClient>(serviceProvider =>
        {
            var settings = serviceProvider.GetRequiredService<ApiSettings>();
            var handler = new HttpClientHandler();
#if DEBUG
            handler.ServerCertificateCustomValidationCallback = static (_, _, _, errors) => true;
#endif
            return new HttpClient(handler) { BaseAddress = new Uri(settings.BaseUrl) };
        });
        builder.Services.AddScoped<IDealsSeekerApiClient, DealsSeekerApiClient>();
        builder.Services.AddScoped<IAppPreferencesService, AppPreferencesService>();

        var logsDirectory = Path.Combine(FileSystem.Current.AppDataDirectory, "logs");
        Directory.CreateDirectory(logsDirectory);
        var mobileLogPath = Path.Combine(logsDirectory, "mobile-.log");

        Log.Logger = new LoggerConfiguration()
#if DEBUG
            .MinimumLevel.Debug()
#else
            .MinimumLevel.Information()
#endif
            .Enrich.FromLogContext()
            .WriteTo.Console(outputTemplate: "{Timestamp:HH:mm:ss} [{Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
            .WriteTo.Debug(outputTemplate: "{Timestamp:HH:mm:ss} [{Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
            .WriteTo.File(
                path: mobileLogPath,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 7,
                shared: true,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
            .CreateLogger();

        builder.Logging.ClearProviders();
        builder.Logging.AddSerilog(Log.Logger, dispose: true);

// NOTE: AddBlazorWebViewDeveloperTools can conflict with BlazorWebView startup in this app.

        AppDomain.CurrentDomain.UnhandledException += (_, args) =>
        {
            var ex = args.ExceptionObject as Exception;
            Log.Fatal(ex, "AppDomain unhandled exception: {Message}", ex?.Message);
            Log.CloseAndFlush();
        };

        TaskScheduler.UnobservedTaskException += (_, args) =>
        {
            Log.Error(args.Exception, "Unobserved task exception: {Message}", args.Exception.Message);
            args.SetObserved();
        };

        var app = builder.Build();
        var startupLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("DealsSeeker.Mobile.Startup");
        startupLogger.LogInformation("DealsSeeker.Mobile startup completed. LogPath={LogPath}", mobileLogPath);
        return app;
    }
    catch (Exception ex)
    {
        // Log to a fallback file since Serilog may not be initialized yet
        var fallbackPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "dealseeker_crash.log");

        File.WriteAllText(fallbackPath,
            $"CRASH at {DateTime.UtcNow}\n" +
            $"Type: {ex.GetType().FullName}\n" +
            $"Message: {ex.Message}\n" +
            $"Stack:\n{ex.StackTrace}\n" +
            $"Inner: {ex.InnerException?.Message}\n" +
            $"InnerStack:\n{ex.InnerException?.StackTrace}");

        throw;
    }
}
}
