using DealsSeeker.Api.Options;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Contracts.AddOffer;
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

        var selectedKey = MapProviders.Normalize(_options.Provider);
        var fallbackKey = MapProviders.Normalize(_options.FallbackProvider);

        if (!TryGetProvider(selectedKey, out var selectedProvider))
        {
            logger.LogWarning("Configured map provider '{Provider}' is unknown. Falling back.", _options.Provider);
            return await TrySearchFallbackAsync(query, fallbackKey, cancellationToken);
        }

        try
        {
            return await selectedProvider.SearchAsync(query, cancellationToken);
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
}
