using DealsSeeker.Api.Options;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Options;

namespace DealsSeeker.Api.Services.Locations;

public sealed class ConfigurableLocationLookupService(
    IOptions<MapsOptions> options,
    IEnumerable<ILocationLookupProvider> providers,
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

        var selectedProviderName = _options.ResolveDisplayProvider();
        var fallbackProviderName = _options.ResolveDisplayFallbackProvider();
        var selectedKey = MapProviders.Normalize(selectedProviderName);
        var fallbackKey = MapProviders.Normalize(fallbackProviderName);

        if (!TryGetProvider(selectedKey, out var selectedLookupProvider))
        {
            logger.LogWarning("Configured display map provider '{Provider}' is unknown. Falling back.", selectedProviderName);
            return await TrySearchFallbackAsync(query, fallbackKey, cancellationToken);
        }

        try
        {
            return await selectedLookupProvider.SearchAsync(query, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Map provider '{Provider}' failed during location lookup. Attempting fallback provider '{FallbackProvider}'.",
                selectedKey,
                fallbackKey);

            return await TrySearchFallbackAsync(query, fallbackKey, cancellationToken);
        }
    }

    public async Task<LocationSearchResultDto?> ReverseAsync(GeoPoint point, CancellationToken cancellationToken)
    {
        var selectedProviderName = _options.ResolveDisplayProvider();
        var fallbackProviderName = _options.ResolveDisplayFallbackProvider();
        var selectedKey = MapProviders.Normalize(selectedProviderName);
        var fallbackKey = MapProviders.Normalize(fallbackProviderName);

        if (!TryGetProvider(selectedKey, out var selectedLookupProvider))
        {
            logger.LogWarning("Configured display map provider '{Provider}' is unknown. Falling back.", selectedProviderName);
            return await TryReverseFallbackAsync(point, fallbackKey, cancellationToken);
        }

        try
        {
            return await selectedLookupProvider.ReverseAsync(point, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Map provider '{Provider}' failed during reverse location lookup. Attempting fallback provider '{FallbackProvider}'.",
                selectedKey,
                fallbackKey);

            return await TryReverseFallbackAsync(point, fallbackKey, cancellationToken);
        }
    }

    private async Task<IReadOnlyList<LocationSearchResultDto>> TrySearchFallbackAsync(
        string query,
        string fallbackKey,
        CancellationToken cancellationToken)
    {
        if (!TryGetProvider(fallbackKey, out var fallbackProvider))
        {
            return [];
        }

        try
        {
            return await fallbackProvider.SearchAsync(query, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Fallback map provider '{Provider}' failed during location lookup.", fallbackKey);
            return [];
        }
    }

    private bool TryGetProvider(string key, out ILocationLookupProvider provider) =>
        _providers.TryGetValue(key, out provider!);

    private async Task<LocationSearchResultDto?> TryReverseFallbackAsync(
        GeoPoint point,
        string fallbackKey,
        CancellationToken cancellationToken)
    {
        if (!TryGetProvider(fallbackKey, out var fallbackProvider))
        {
            return null;
        }

        try
        {
            return await fallbackProvider.ReverseAsync(point, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Fallback map provider '{Provider}' failed during reverse location lookup.", fallbackKey);
            return null;
        }
    }
}
