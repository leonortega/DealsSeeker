using DealsSeeker.Shared.Models;
using System.Globalization;

namespace DealsSeeker.Mobile.Services.Device;

public sealed class MapLauncherService : IMapLauncherService
{
    public async Task OpenWalkingDirectionsAsync(GeoPoint destination, CancellationToken cancellationToken)
    {
        var lat = destination.Lat.ToString(CultureInfo.InvariantCulture);
        var lng = destination.Lng.ToString(CultureInfo.InvariantCulture);
        var webUri = $"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=walking";

        if (DeviceInfo.Current.Platform == DevicePlatform.WinUI || DeviceInfo.Current.Platform == DevicePlatform.MacCatalyst)
        {
            await Browser.Default.OpenAsync(webUri, BrowserLaunchMode.External);
            return;
        }

        if (DeviceInfo.Current.Platform == DevicePlatform.Android)
        {
            var appUri = $"google.navigation:q={lat},{lng}&mode=w";
            if (await Launcher.Default.CanOpenAsync(appUri))
            {
                await Launcher.Default.OpenAsync(appUri);
                return;
            }
        }

        if (DeviceInfo.Current.Platform == DevicePlatform.iOS)
        {
            var appUri = $"comgooglemaps://?daddr={lat},{lng}&directionsmode=walking";
            if (await Launcher.Default.CanOpenAsync(appUri))
            {
                await Launcher.Default.OpenAsync(appUri);
                return;
            }
        }

        await Browser.Default.OpenAsync(webUri, BrowserLaunchMode.External);
    }
}
