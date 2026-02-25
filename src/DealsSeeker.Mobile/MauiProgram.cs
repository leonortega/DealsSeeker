using DealsSeeker.Mobile.Services.Api;
using DealsSeeker.Mobile.Services.Device;
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
        builder.Services.AddSingleton(new ApiSettings());
        builder.Services.AddSingleton<IDeviceLocationService, DeviceLocationService>();
        builder.Services.AddSingleton<IMapLauncherService, MapLauncherService>();
        builder.Services.AddSingleton<IMediaCaptureService, MediaCaptureService>();
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
