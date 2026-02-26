using DealsSeeker.Shared.Models;
using System.Globalization;
using DealsSeeker.Mobile.Services.Api;
using DealsSeeker.Shared.Configuration;

namespace DealsSeeker.Mobile.Services.Device;

public sealed class MapLauncherService(
    ApiSettings settings,
    IDeviceLocationService deviceLocation) : IMapLauncherService
{
    public async Task OpenWalkingDirectionsAsync(GeoPoint destination, CancellationToken cancellationToken)
    {
        var lat = destination.Lat.ToString(CultureInfo.InvariantCulture);
        var lng = destination.Lng.ToString(CultureInfo.InvariantCulture);
        var mapProvider = ResolveProvider(settings.MapProvider, settings.MapProviderFallback);
        var webUri = mapProvider == MapProviders.OpenLayers
            ? await BuildOpenLayersWalkingUriAsync(destination, cancellationToken)
            : $"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=walking";

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
            var appUri = $"maps://?daddr={lat},{lng}&dirflg=w";
            if (await Launcher.Default.CanOpenAsync(appUri))
            {
                await Launcher.Default.OpenAsync(appUri);
                return;
            }
        }

        await Browser.Default.OpenAsync(webUri, BrowserLaunchMode.External);
    }

    private static string ResolveProvider(string? selectedProvider, string? fallbackProvider)
    {
        var normalized = MapProviders.Normalize(selectedProvider);
        if (!string.IsNullOrWhiteSpace(normalized))
        {
            return normalized;
        }

        var fallback = MapProviders.Normalize(fallbackProvider);
        return string.IsNullOrWhiteSpace(fallback) ? MapProviders.OpenLayers : fallback;
    }

    private async Task<string> BuildOpenLayersWalkingUriAsync(GeoPoint destination, CancellationToken cancellationToken)
    {
        var destinationLat = destination.Lat.ToString(CultureInfo.InvariantCulture);
        var destinationLng = destination.Lng.ToString(CultureInfo.InvariantCulture);

        var origin = await deviceLocation.TryGetCurrentLocationAsync(cancellationToken);
        if (origin is null)
        {
            return $"https://www.openstreetmap.org/?mlat={destinationLat}&mlon={destinationLng}#map=16/{destinationLat}/{destinationLng}";
        }

        var originLat = origin.Lat.ToString(CultureInfo.InvariantCulture);
        var originLng = origin.Lng.ToString(CultureInfo.InvariantCulture);
        return $"https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route={originLat}%2C{originLng}%3B{destinationLat}%2C{destinationLng}";
    }
}
