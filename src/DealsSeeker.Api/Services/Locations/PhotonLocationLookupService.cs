using System.Globalization;
using System.Text.Json;
using DealsSeeker.Api.Caching;
using DealsSeeker.Api.Options;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace DealsSeeker.Api.Services.Locations;

/// <summary>The only geocoding adapter: Photon, for both forward and reverse lookups.</summary>
public sealed class PhotonLocationLookupService(
    HttpClient httpClient,
    ICacheService cache,
    ILogger<PhotonLocationLookupService> logger,
    IOptions<PhotonOptions> options) : ILocationLookupService
{
    private readonly PhotonOptions _options = options.Value;

    public async Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var normalizedQuery = query.Trim();
        var cacheKey = CacheKeys.GeocodeKey(normalizedQuery.ToLowerInvariant());
        var cached = await cache.GetAsync<IReadOnlyList<LocationSearchResultDto>>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        try
        {
            var results = await SearchInternalAsync(BuildSearchEndpoint(normalizedQuery), cancellationToken);
            cache.Set(cacheKey, results, results.Count > 0 ? CacheTtl.Geocode : CacheTtl.GeocodeNegative);
            return results;
        }
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning(ex, "Photon search failed for query '{Query}'", normalizedQuery);
            throw new LocationProviderUnavailableException(ProviderUnavailableMessage, ex);
        }
    }

    public async Task<LocationSearchResultDto?> ReverseAsync(GeoPoint point, CancellationToken cancellationToken)
    {
        var cacheKey = CacheKeys.ReverseGeocodeKey(point.Lat, point.Lng);
        var cached = await cache.GetAsync<LocationSearchResultDto>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        try
        {
            var result = await ReverseInternalAsync(BuildReverseEndpoint(point), cancellationToken);
            if (result is not null)
            {
                cache.Set(cacheKey, result, CacheTtl.Geocode);
            }

            return result;
        }
        catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning(ex, "Photon reverse lookup failed for {Lat},{Lng}", point.Lat, point.Lng);
            throw new LocationProviderUnavailableException(ProviderUnavailableMessage, ex);
        }
    }

    private const string ProviderUnavailableMessage =
        "The location provider is unavailable. The lookup could not be completed.";

    private async Task<IReadOnlyList<LocationSearchResultDto>> SearchInternalAsync(string endpoint, CancellationToken cancellationToken)
    {
        using var json = await ReadJsonAsync(endpoint, cancellationToken);
        if (json.RootElement.ValueKind != JsonValueKind.Object ||
            !json.RootElement.TryGetProperty("features", out var features) ||
            features.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return ParseFeatures(features);
    }

    private async Task<LocationSearchResultDto?> ReverseInternalAsync(string endpoint, CancellationToken cancellationToken)
    {
        using var json = await ReadJsonAsync(endpoint, cancellationToken);
        if (json.RootElement.ValueKind != JsonValueKind.Object ||
            !json.RootElement.TryGetProperty("features", out var features) ||
            features.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        return ParseFeatures(features).FirstOrDefault();
    }

    private async Task<JsonDocument> ReadJsonAsync(string endpoint, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        if (!string.IsNullOrWhiteSpace(_options.UserAgent))
        {
            request.Headers.TryAddWithoutValidation(HeaderNames.UserAgent, _options.UserAgent);
        }

        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        return await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
    }

    private static IReadOnlyList<LocationSearchResultDto> ParseFeatures(JsonElement features)
    {
        var results = new List<LocationSearchResultDto>();
        foreach (var feature in features.EnumerateArray())
        {
            if (!feature.TryGetProperty("geometry", out var geometry) ||
                !geometry.TryGetProperty("coordinates", out var coordinates) ||
                coordinates.ValueKind != JsonValueKind.Array ||
                coordinates.GetArrayLength() < 2)
            {
                continue;
            }

            var lng = coordinates[0].GetDouble();
            var lat = coordinates[1].GetDouble();
            results.Add(new LocationSearchResultDto(BuildLabel(feature), new GeoPoint(lat, lng)));
        }

        return results;
    }

    private static string BuildLabel(JsonElement feature)
    {
        if (!feature.TryGetProperty("properties", out var properties) || properties.ValueKind != JsonValueKind.Object)
        {
            return "Unknown location";
        }

        string Read(string name) =>
            properties.TryGetProperty(name, out var value) ? value.GetString() ?? string.Empty : string.Empty;

        var houseNumber = Read("housenumber");
        var street = Read("street");
        var streetLine = string.Join(" ", new[] { houseNumber, street }.Where(x => !string.IsNullOrWhiteSpace(x)));

        var pieces = new[]
        {
            Read("name"),
            streetLine,
            Read("postcode"),
            Read("city"),
            Read("state"),
            Read("country")
        }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return pieces.Length > 0 ? string.Join(", ", pieces) : "Unknown location";
    }

    private string BuildSearchEndpoint(string query)
    {
        var maxResults = Math.Clamp(_options.MaxResults, 1, 25);
        return $"{PhotonRoot()}/api?q={Uri.EscapeDataString(query)}&limit={maxResults}";
    }

    private string BuildReverseEndpoint(GeoPoint point)
    {
        var lat = point.Lat.ToString("G17", CultureInfo.InvariantCulture);
        var lng = point.Lng.ToString("G17", CultureInfo.InvariantCulture);
        return $"{PhotonRoot()}/reverse?lat={lat}&lon={lng}";
    }

    private string PhotonRoot()
    {
        var root = _options.BaseUrl.Trim().TrimEnd('/');
        return root.EndsWith("/api", StringComparison.OrdinalIgnoreCase) ? root[..^4] : root;
    }
}
