using System.Globalization;
using DealsSeeker.Mobile.Services.Api;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Maps;

public sealed class MapRenderingService(ApiSettings settings) : IMapRenderingService
{
    public string BuildMapEmbedUrl(GeoPoint center, IReadOnlyList<BusinessMarkerDto> markers, int zoom)
    {
        var lat = center.Lat.ToString(CultureInfo.InvariantCulture);
        var lng = center.Lng.ToString(CultureInfo.InvariantCulture);
        var provider = ResolveProvider(settings.MapDisplayProvider, settings.MapDisplayProviderFallback);

        return provider switch
        {
            MapProviders.OpenLayers => BuildOpenLayersEmbedUrl(center, markers, zoom, showUserMarker: true),
            _ => $"https://maps.google.com/maps?q={lat},{lng}&z={zoom}&output=embed"
        };
    }

    public string BuildLocationPreviewMapUrl(GeoPoint location, string? label, int zoom)
    {
        var lat = location.Lat.ToString(CultureInfo.InvariantCulture);
        var lng = location.Lng.ToString(CultureInfo.InvariantCulture);
        var provider = ResolveProvider(settings.MapDisplayProvider, settings.MapDisplayProviderFallback);

        return provider switch
        {
            MapProviders.OpenLayers => BuildOpenLayersEmbedUrl(
                location,
                [new BusinessMarkerDto("selected-location", label ?? "Selected location", location, 0)],
                zoom,
                showUserMarker: false),
            _ => $"https://maps.google.com/maps?q={lat},{lng}&z={zoom}&output=embed"
        };
    }

    private static string BuildOpenLayersEmbedUrl(
        GeoPoint center,
        IReadOnlyList<BusinessMarkerDto> markers,
        int zoom,
        bool showUserMarker)
    {
        var markerData = string.Join(
            ';',
            markers.Select(marker =>
            {
                var name = (marker.Name ?? string.Empty).Replace("|", " ").Replace(";", " ");
                return string.Join(
                    '|',
                    marker.Location.Lat.ToString(CultureInfo.InvariantCulture),
                    marker.Location.Lng.ToString(CultureInfo.InvariantCulture),
                    name);
            }));

        var query = new Dictionary<string, string?>
        {
            ["lat"] = center.Lat.ToString(CultureInfo.InvariantCulture),
            ["lng"] = center.Lng.ToString(CultureInfo.InvariantCulture),
            ["zoom"] = Math.Clamp(zoom, 2, 18).ToString(CultureInfo.InvariantCulture),
            ["markers"] = markerData,
            ["showUser"] = showUserMarker ? "1" : "0"
        };

        var queryString = string.Join("&",
            query
                .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                .Select(x => $"{Uri.EscapeDataString(x.Key)}={Uri.EscapeDataString(x.Value!)}"));

        return $"/maps/openlayers.html?{queryString}";
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
}
