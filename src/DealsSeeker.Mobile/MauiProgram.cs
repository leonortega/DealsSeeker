using DealsSeeker.Mobile.Services.Api;
using DealsSeeker.Mobile.Services.Auth;
using DealsSeeker.Mobile.Services.Device;
using DealsSeeker.Mobile.Services.Maps;
using DealsSeeker.Mobile.Services.Reports;
using Microsoft.Extensions.Logging;

namespace DealsSeeker.Mobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        builder.Services.AddMauiBlazorWebView();
        var defaultApiSettings = new ApiSettings();
        var apiConfiguration = builder.Configuration.GetSection("Api");
        builder.Services.AddSingleton(new ApiSettings
        {
            BaseUrl = apiConfiguration["BaseUrl"] ?? defaultApiSettings.BaseUrl,
            MapProvider = apiConfiguration["MapProvider"] ?? defaultApiSettings.MapProvider,
            MapProviderFallback = apiConfiguration["MapProviderFallback"] ?? defaultApiSettings.MapProviderFallback
        });
        builder.Services.AddSingleton<IUserSessionService, UserSessionService>();
        builder.Services.AddSingleton<IDeviceLocationService, DeviceLocationService>();
        builder.Services.AddSingleton<IMapLauncherService, MapLauncherService>();
        builder.Services.AddSingleton<IMapRenderingService, MapRenderingService>();
        builder.Services.AddSingleton<IMediaCaptureService, MediaCaptureService>();
        builder.Services.AddSingleton<IReportDraftContext, ReportDraftContext>();
        builder.Services.AddScoped<HttpClient>(serviceProvider =>
        {
            var settings = serviceProvider.GetRequiredService<ApiSettings>();
            var handler = new HttpClientHandler();
#if DEBUG
            handler.ServerCertificateCustomValidationCallback = static (_, _, _, errors) =>
                true;
#endif
            return new HttpClient(handler)
            {
                BaseAddress = new Uri(settings.BaseUrl)
            };
        });
        builder.Services.AddScoped<IDealsSeekerApiClient, DealsSeekerApiClient>();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
