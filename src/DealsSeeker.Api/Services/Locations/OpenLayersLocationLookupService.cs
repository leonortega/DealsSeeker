using System.Globalization;
using System.Text.Json;
using DealsSeeker.Api.Options;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace DealsSeeker.Api.Services.Locations;

public sealed class OpenLayersLocationLookupService(
    HttpClient httpClient,
    ILogger<OpenLayersLocationLookupService> logger,
    IOptions<OpenLayersOptions> options) : ILocationLookupProvider
{
    private readonly OpenLayersOptions _options = options.Value;

    public string ProviderKey => MapProviders.OpenLayers;

    public async Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var maxResults = Math.Clamp(_options.MaxResults, 1, 25);
        var endpoints = new[]
        {
            BuildEndpoint(_options.GeocodingBaseUrl, query, maxResults),
            BuildEndpoint(_options.FallbackGeocodingBaseUrl, query, maxResults)
        }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        Exception? lastException = null;
        foreach (var endpoint in endpoints)
        {
            try
            {
                var results = await SearchInternalAsync(endpoint, cancellationToken);
                if (results.Count > 0)
                {
                    return results;
                }
            }
            catch (Exception ex)
            {
                lastException = ex;
                logger.LogWarning(ex, "OpenLayers geocoding endpoint failed: {Endpoint}", endpoint);
            }
        }

        if (lastException is not null)
        {
            throw new HttpRequestException("OpenLayers geocoding failed for configured endpoints.", lastException);
        }

        return [];
    }

    private async Task<IReadOnlyList<LocationSearchResultDto>> SearchInternalAsync(string endpoint, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        if (!string.IsNullOrWhiteSpace(_options.UserAgent))
        {
            request.Headers.TryAddWithoutValidation(HeaderNames.UserAgent, _options.UserAgent);
        }

        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var json = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (json.RootElement.ValueKind == JsonValueKind.Array)
        {
            return ParseNominatimArray(json.RootElement);
        }

        if (json.RootElement.ValueKind == JsonValueKind.Object &&
            json.RootElement.TryGetProperty("features", out var featuresElement) &&
            featuresElement.ValueKind == JsonValueKind.Array)
        {
            return ParsePhotonFeatures(featuresElement);
        }

        return [];
    }

    private static IReadOnlyList<LocationSearchResultDto> ParseNominatimArray(JsonElement items)
    {
        var results = new List<LocationSearchResultDto>();
        foreach (var item in items.EnumerateArray())
        {
            if (!item.TryGetProperty("display_name", out var displayNameElement) ||
                !item.TryGetProperty("lat", out var latElement) ||
                !item.TryGetProperty("lon", out var lonElement))
            {
                continue;
            }

            if (!double.TryParse(latElement.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var lat) ||
                !double.TryParse(lonElement.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var lng))
            {
                continue;
            }

            results.Add(new LocationSearchResultDto(
                displayNameElement.GetString() ?? "Unknown location",
                new GeoPoint(lat, lng)));
        }

        return results;
    }

    private static IReadOnlyList<LocationSearchResultDto> ParsePhotonFeatures(JsonElement featuresElement)
    {
        var results = new List<LocationSearchResultDto>();
        foreach (var feature in featuresElement.EnumerateArray())
        {
            if (!feature.TryGetProperty("geometry", out var geometryElement) ||
                !geometryElement.TryGetProperty("coordinates", out var coordinatesElement) ||
                coordinatesElement.ValueKind != JsonValueKind.Array ||
                coordinatesElement.GetArrayLength() < 2)
            {
                continue;
            }

            var lng = coordinatesElement[0].GetDouble();
            var lat = coordinatesElement[1].GetDouble();
            var label = BuildPhotonLabel(feature);

            results.Add(new LocationSearchResultDto(label, new GeoPoint(lat, lng)));
        }

        return results;
    }

    private static string BuildPhotonLabel(JsonElement feature)
    {
        if (!feature.TryGetProperty("properties", out var properties) || properties.ValueKind != JsonValueKind.Object)
        {
            return "Unknown location";
        }

        string Read(string name) =>
            properties.TryGetProperty(name, out var value) ? value.GetString() ?? string.Empty : string.Empty;

        var name = Read("name");
        var houseNumber = Read("housenumber");
        var street = Read("street");
        var postcode = Read("postcode");
        var city = Read("city");
        var state = Read("state");
        var country = Read("country");

        var streetLine = string.Join(" ",
            new[] { houseNumber, street }
                .Where(x => !string.IsNullOrWhiteSpace(x)));

        var pieces = new[]
        {
            name,
            streetLine,
            postcode,
            city,
            state,
            country
        }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (pieces.Length > 0)
        {
            return string.Join(", ", pieces);
        }

        return "Unknown location";
    }

    private static string BuildEndpoint(string baseUrl, string query, int maxResults)
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return string.Empty;
        }

        var trimmed = baseUrl.Trim().TrimEnd('/');
        var encodedQuery = Uri.EscapeDataString(query);

        if (trimmed.Contains("photon.komoot.io", StringComparison.OrdinalIgnoreCase))
        {
            return $"{trimmed}?q={encodedQuery}&limit={maxResults}";
        }

        if (trimmed.Contains("nominatim", StringComparison.OrdinalIgnoreCase))
        {
            return $"{trimmed}/search?format=jsonv2&limit={maxResults}&q={encodedQuery}";
        }

        var separator = trimmed.Contains('?') ? "&" : "?";
        return $"{trimmed}{separator}q={encodedQuery}&limit={maxResults}";
    }
}
