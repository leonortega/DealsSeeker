using System.Globalization;
using DealsSeeker.Mobile;
using DealsSeeker.Mobile.Services.Api;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Localization;

namespace DealsSeeker.Mobile.Services.Maps;

public sealed class MapRenderingService(ApiSettings settings, IStringLocalizer<AppStrings> localizer) : IMapRenderingService
{
    public string BuildMapEmbedUrl(GeoPoint center, IReadOnlyList<BusinessMarkerDto> markers, int zoom)
    {
        var provider = ResolveRenderableProvider(settings.MapDisplayProvider, settings.MapDisplayProviderFallback);
        return BuildEmbedUrlForProvider(center, markers, zoom, showUserMarker: true, provider, settings.MapDisplayProviderFallback);
    }

    public string BuildLocationPreviewMapUrl(GeoPoint location, string? label, int zoom)
    {
        var provider = ResolveRenderableProvider(settings.MapDisplayProvider, settings.MapDisplayProviderFallback);
        var markers = (IReadOnlyList<BusinessMarkerDto>)[new BusinessMarkerDto(
            "selected-location",
            label ?? Translate("maps.selectedLocation", "Selected location"),
            location,
            0)];

        return BuildEmbedUrlForProvider(location, markers, zoom, showUserMarker: false, provider, settings.MapDisplayProviderFallback);
    }

    private string BuildEmbedUrlForProvider(
        GeoPoint center,
        IReadOnlyList<BusinessMarkerDto> markers,
        int zoom,
        bool showUserMarker,
        string provider,
        string? configuredFallbackProvider)
    {
        return provider switch
        {
            MapProviders.GoogleMaps => BuildGoogleMapsEmbedUrl(center, markers, zoom, showUserMarker, configuredFallbackProvider),
            _ => BuildOpenLayersEmbedUrl(center, markers, zoom, showUserMarker)
        };
    }

    private string BuildGoogleMapsEmbedUrl(
        GeoPoint center,
        IReadOnlyList<BusinessMarkerDto> markers,
        int zoom,
        bool showUserMarker,
        string? configuredFallbackProvider)
    {
        var query = BuildMapQuery(center, markers, zoom, showUserMarker);
        query["key"] = settings.GoogleMapsApiKey;

        var fallbackProvider = MapProviders.Normalize(configuredFallbackProvider);
        if (!string.IsNullOrWhiteSpace(fallbackProvider) && !string.Equals(fallbackProvider, MapProviders.GoogleMaps, StringComparison.OrdinalIgnoreCase))
        {
            query["fallback"] = fallbackProvider;
        }

        return $"/maps/googlemaps.html?{BuildQueryString(query)}";
    }

    private static string BuildOpenLayersEmbedUrl(
        GeoPoint center,
        IReadOnlyList<BusinessMarkerDto> markers,
        int zoom,
        bool showUserMarker)
    {
        return $"/maps/openlayers.html?{BuildQueryString(BuildMapQuery(center, markers, zoom, showUserMarker))}";
    }

    private string ResolveRenderableProvider(string? selectedProvider, string? fallbackProvider)
    {
        var normalized = MapProviders.Normalize(selectedProvider);
        if (CanRenderWithProvider(normalized))
        {
            return normalized;
        }

        var fallback = MapProviders.Normalize(fallbackProvider);
        if (CanRenderWithProvider(fallback))
        {
            return fallback;
        }

        return MapProviders.OpenLayers;
    }

    private bool CanRenderWithProvider(string? provider)
    {
        if (string.IsNullOrWhiteSpace(provider))
        {
            return false;
        }

        if (string.Equals(provider, MapProviders.GoogleMaps, StringComparison.OrdinalIgnoreCase))
        {
            return !string.IsNullOrWhiteSpace(settings.GoogleMapsApiKey);
        }

        return string.Equals(provider, MapProviders.OpenLayers, StringComparison.OrdinalIgnoreCase);
    }

    private static Dictionary<string, string?> BuildMapQuery(
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

        return new Dictionary<string, string?>
        {
            ["lat"] = center.Lat.ToString(CultureInfo.InvariantCulture),
            ["lng"] = center.Lng.ToString(CultureInfo.InvariantCulture),
            ["zoom"] = Math.Clamp(zoom, 2, 18).ToString(CultureInfo.InvariantCulture),
            ["markers"] = markerData,
            ["showUser"] = showUserMarker ? "1" : "0"
        };
    }

    private static string BuildQueryString(IReadOnlyDictionary<string, string?> query)
    {
        return string.Join("&",
            query
                .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                .Select(x => $"{Uri.EscapeDataString(x.Key)}={Uri.EscapeDataString(x.Value!)}"));
    }

    private string Translate(string key, string fallback)
    {
        var value = localizer[key];
        return value.ResourceNotFound ? fallback : value.Value;
    }
}
