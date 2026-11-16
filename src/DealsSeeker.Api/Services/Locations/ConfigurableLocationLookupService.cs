using DealsSeeker.Api.Caching;
using DealsSeeker.Api.Options;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Options;

namespace DealsSeeker.Api.Services.Locations;

/// <summary>
/// Resolves the configured map provider, falls back to the configured alternative when it fails,
/// and reuses previously obtained results for identical lookups.
/// </summary>
public sealed class ConfigurableLocationLookupService(
    IOptions<MapsOptions> options,
    IEnumerable<ILocationLookupProvider> providers,
    ICacheService cache,
    ILogger<ConfigurableLocationLookupService> logger) : ILocationLookupService
{
    private readonly MapsOptions _options = options.Value;
    private readonly Dictionary<string, ILocationLookupProvider> _providers = providers
        .ToDictionary(x => MapProviders.Normalize(x.ProviderKey), StringComparer.OrdinalIgnoreCase);

    public async Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var normalizedQuery = query.Trim();
        var cacheKey = CacheKeys.GeocodeKey("resolved", normalizedQuery.ToLowerInvariant());

        var cached = await cache.GetAsync<IReadOnlyList<LocationSearchResultDto>>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var (selectedKey, fallbackKey) = ResolveProviderKeys();

        if (!TryGetProvider(selectedKey, out var selectedProvider))
        {
            logger.LogWarning("Configured display map provider '{Provider}' is unknown. Falling back.", selectedKey);
            return await SearchWithFallbackAsync(fallbackKey, normalizedQuery, cacheKey, cancellationToken);
        }

        try
        {
            var results = await selectedProvider.SearchAsync(normalizedQuery, cancellationToken);
            cache.Set(cacheKey, results, results.Count > 0 ? CacheTtl.Geocode : CacheTtl.GeocodeNegative);
            return results;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Map provider '{Provider}' failed during location lookup. Attempting fallback provider '{FallbackProvider}'.",
                selectedKey,
                fallbackKey);

            return await SearchWithFallbackAsync(fallbackKey, normalizedQuery, cacheKey, cancellationToken);
        }
    }

    public async Task<LocationSearchResultDto?> ReverseAsync(GeoPoint point, CancellationToken cancellationToken)
    {
        var cacheKey = CacheKeys.ReverseGeocodeKey("resolved", point.Lat, point.Lng);

        var cached = await cache.GetAsync<LocationSearchResultDto>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var (selectedKey, fallbackKey) = ResolveProviderKeys();

        if (!TryGetProvider(selectedKey, out var selectedProvider))
        {
            logger.LogWarning("Configured display map provider '{Provider}' is unknown. Falling back.", selectedKey);
            return await ReverseWithFallbackAsync(fallbackKey, point, cacheKey, cancellationToken);
        }

        try
        {
            var result = await selectedProvider.ReverseAsync(point, cancellationToken);
            if (result is not null)
            {
                cache.Set(cacheKey, result, CacheTtl.Geocode);
            }

            return result;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Map provider '{Provider}' failed during reverse location lookup. Attempting fallback provider '{FallbackProvider}'.",
                selectedKey,
                fallbackKey);

            return await ReverseWithFallbackAsync(fallbackKey, point, cacheKey, cancellationToken);
        }
    }

    private async Task<IReadOnlyList<LocationSearchResultDto>> SearchWithFallbackAsync(
        string fallbackKey,
        string query,
        string cacheKey,
        CancellationToken cancellationToken)
    {
        if (!TryGetProvider(fallbackKey, out var fallbackProvider))
        {
            throw new LocationProviderUnavailableException(
                $"No usable map provider is configured. Display provider '{fallbackKey}' is unknown.");
        }

        try
        {
            var results = await fallbackProvider.SearchAsync(query, cancellationToken);
            cache.Set(cacheKey, results, results.Count > 0 ? CacheTtl.Geocode : CacheTtl.GeocodeNegative);
            return results;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Fallback map provider '{Provider}' failed during location lookup.", fallbackKey);
            throw new LocationProviderUnavailableException(
                "Every configured map provider failed to answer the location lookup.",
                ex);
        }
    }

    private async Task<LocationSearchResultDto?> ReverseWithFallbackAsync(
        string fallbackKey,
        GeoPoint point,
        string cacheKey,
        CancellationToken cancellationToken)
    {
        if (!TryGetProvider(fallbackKey, out var fallbackProvider))
        {
            throw new LocationProviderUnavailableException(
                $"No usable map provider is configured. Display provider '{fallbackKey}' is unknown.");
        }

        try
        {
            var result = await fallbackProvider.ReverseAsync(point, cancellationToken);
            if (result is not null)
            {
                cache.Set(cacheKey, result, CacheTtl.Geocode);
            }

            return result;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Fallback map provider '{Provider}' failed during reverse location lookup.", fallbackKey);
            throw new LocationProviderUnavailableException(
                "Every configured map provider failed to answer the reverse location lookup.",
                ex);
        }
    }

    private (string SelectedKey, string FallbackKey) ResolveProviderKeys()
    {
        var selectedKey = MapProviders.Normalize(_options.ResolveDisplayProvider());
        var fallbackKey = MapProviders.Normalize(_options.ResolveDisplayFallbackProvider());
        return (selectedKey, fallbackKey);
    }

    private bool TryGetProvider(string key, out ILocationLookupProvider provider) =>
        _providers.TryGetValue(key, out provider!);
}
