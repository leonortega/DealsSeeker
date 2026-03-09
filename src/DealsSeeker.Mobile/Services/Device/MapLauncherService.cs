using DealsSeeker.Shared.Models;
using System.Globalization;
using DealsSeeker.Mobile.Services.Api;
using DealsSeeker.Mobile.Services.Preferences;
using DealsSeeker.Shared.Configuration;

namespace DealsSeeker.Mobile.Services.Device;

public sealed class MapLauncherService(
    ApiSettings settings,
    IDeviceLocationService deviceLocation) : IMapLauncherService
{
    public async Task OpenDirectionsAsync(GeoPoint destination, string navigationMode, CancellationToken cancellationToken)
    {
        var lat = destination.Lat.ToString(CultureInfo.InvariantCulture);
        var lng = destination.Lng.ToString(CultureInfo.InvariantCulture);
        var normalizedMode = NavigationModes.Normalize(navigationMode);
        var mapProvider = ResolveProvider(settings.MapRedirectProvider, settings.MapRedirectProviderFallback);
        var webUri = mapProvider == MapProviders.OpenLayers
            ? await BuildOpenLayersDirectionsUriAsync(destination, normalizedMode, cancellationToken)
            : $"https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode={BuildGoogleTravelMode(normalizedMode)}";

        if (DeviceInfo.Current.Platform == DevicePlatform.WinUI || DeviceInfo.Current.Platform == DevicePlatform.MacCatalyst)
        {
            await Browser.Default.OpenAsync(webUri, BrowserLaunchMode.External);
            return;
        }

        if (DeviceInfo.Current.Platform == DevicePlatform.Android)
        {
            var appUri = $"google.navigation:q={lat},{lng}&mode={BuildAndroidMode(normalizedMode)}";
            if (await Launcher.Default.CanOpenAsync(appUri))
            {
                await Launcher.Default.OpenAsync(appUri);
                return;
            }
        }

        if (DeviceInfo.Current.Platform == DevicePlatform.iOS)
        {
            var appUri = $"maps://?daddr={lat},{lng}&dirflg={BuildIosMode(normalizedMode)}";
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

    private async Task<string> BuildOpenLayersDirectionsUriAsync(
        GeoPoint destination,
        string navigationMode,
        CancellationToken cancellationToken)
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
        return $"https://www.openstreetmap.org/directions?engine={BuildOpenStreetMapEngine(navigationMode)}&route={originLat}%2C{originLng}%3B{destinationLat}%2C{destinationLng}";
    }

    private static string BuildGoogleTravelMode(string navigationMode) =>
        navigationMode == NavigationModes.Car ? "driving" : "walking";

    private static string BuildAndroidMode(string navigationMode) =>
        navigationMode == NavigationModes.Car ? "d" : "w";

    private static string BuildIosMode(string navigationMode) =>
        navigationMode == NavigationModes.Car ? "d" : "w";

    private static string BuildOpenStreetMapEngine(string navigationMode) =>
        navigationMode == NavigationModes.Car ? "fossgis_osrm_car" : "fossgis_osrm_foot";
}
