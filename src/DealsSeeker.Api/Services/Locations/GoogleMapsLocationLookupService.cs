using System.Text.Json;
using DealsSeeker.Api.Options;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Options;

namespace DealsSeeker.Api.Services.Locations;

public sealed class GoogleMapsLocationLookupService(
    HttpClient httpClient,
    IOptions<GoogleMapsOptions> options,
    ILogger<GoogleMapsLocationLookupService> logger) : ILocationLookupProvider
{
    private readonly GoogleMapsOptions _options = options.Value;
    public string ProviderKey => MapProviders.GoogleMaps;

    public async Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            logger.LogWarning("Google Maps API key is missing.");
            throw new InvalidOperationException("Google Maps API key is missing.");
        }

        var endpoint = $"{_options.GeocodingBaseUrl}?address={Uri.EscapeDataString(query)}&key={Uri.EscapeDataString(_options.ApiKey)}";
        using var response = await httpClient.GetAsync(endpoint, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var json = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (!json.RootElement.TryGetProperty("results", out var resultsElement) || resultsElement.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var results = new List<LocationSearchResultDto>();
        foreach (var result in resultsElement.EnumerateArray())
        {
            if (!result.TryGetProperty("formatted_address", out var addressElement))
            {
                continue;
            }

            if (!result.TryGetProperty("geometry", out var geometryElement) ||
                !geometryElement.TryGetProperty("location", out var locationElement))
            {
                continue;
            }

            var lat = locationElement.GetProperty("lat").GetDouble();
            var lng = locationElement.GetProperty("lng").GetDouble();

            results.Add(new LocationSearchResultDto(
                addressElement.GetString() ?? "Unknown location",
                new GeoPoint(lat, lng)));
        }

        return results;
    }
}
