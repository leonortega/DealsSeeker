using DealsSeeker.Api.Caching;
using DealsSeeker.Api.Options;
using DealsSeeker.Api.Services.Locations;
using DealsSeeker.Shared.Configuration;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace DealsSeeker.UnitTests.Services;

public class ConfigurableLocationLookupServiceTests
{
    private static readonly GeoPoint Point = new(40.7128, -74.006);
    private static readonly LocationSearchResultDto Result = new("Central Park", Point);

    private sealed class StubCache : ICacheService
    {
        private readonly Dictionary<string, object> _values = new(StringComparer.Ordinal);
        public readonly List<(string Key, TimeSpan Ttl)> Writes = [];

        public void Seed<T>(string key, T value) => _values[key] = value!;

        public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) =>
            Task.FromResult(_values.TryGetValue(key, out var value) ? (T?)value : default);

        public void Set<T>(string key, T value, TimeSpan timeToLive)
        {
            _values[key] = value!;
            Writes.Add((key, timeToLive));
        }

        public void Remove(string key) => _values.Remove(key);
    }

    private sealed class StubProvider(string key, IReadOnlyList<LocationSearchResultDto>? searchResults = null, LocationSearchResultDto? reverseResult = null, bool throws = false)
        : ILocationLookupProvider
    {
        public string ProviderKey { get; } = key;
        public int SearchCalls { get; private set; }
        public int ReverseCalls { get; private set; }

        public Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken)
        {
            SearchCalls++;
            if (throws)
            {
                throw new InvalidOperationException("provider down");
            }

            return Task.FromResult(searchResults ?? []);
        }

        public Task<LocationSearchResultDto?> ReverseAsync(GeoPoint point, CancellationToken cancellationToken)
        {
            ReverseCalls++;
            if (throws)
            {
                throw new InvalidOperationException("provider down");
            }

            return Task.FromResult(reverseResult);
        }
    }

    private static ConfigurableLocationLookupService CreateService(
        StubCache cache,
        MapsOptions options,
        params ILocationLookupProvider[] providers) =>
        new(
            Options.Create(options),
            providers,
            cache,
            NullLogger<ConfigurableLocationLookupService>.Instance);

    private static MapsOptions OptionsFor(string selected, string fallback) => new()
    {
        DisplayProvider = selected,
        DisplayFallbackProvider = fallback
    };

    [Fact]
    public async Task SearchAsync_BlankQuery_ReturnsEmptyWithoutCallingProviders()
    {
        var cache = new StubCache();
        var primary = new StubProvider(MapProviders.GoogleMaps, [Result]);
        var service = CreateService(cache, OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers), primary);

        Assert.Empty(await service.SearchAsync("  ", TestContext.Current.CancellationToken));
        Assert.Equal(0, primary.SearchCalls);
    }

    [Fact]
    public async Task SearchAsync_CacheHit_ReturnsCachedResults()
    {
        var cache = new StubCache();
        cache.Seed("geocode:resolved:central park", new[] { Result });
        var primary = new StubProvider(MapProviders.GoogleMaps, [Result]);
        var service = CreateService(cache, OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers), primary);

        var results = await service.SearchAsync(" Central Park ", TestContext.Current.CancellationToken);

        Assert.Equal([Result], results);
        Assert.Equal(0, primary.SearchCalls);
    }

    [Fact]
    public async Task SearchAsync_UsesSelectedProviderAndCachesNonEmptyResults()
    {
        var cache = new StubCache();
        var primary = new StubProvider(MapProviders.GoogleMaps, [Result]);
        var fallback = new StubProvider(MapProviders.OpenLayers, [Result]);
        var service = CreateService(cache, OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers), primary, fallback);

        var results = await service.SearchAsync("CentraL Park", TestContext.Current.CancellationToken);

        Assert.Equal([Result], results);
        Assert.Equal(1, primary.SearchCalls);
        Assert.Equal(0, fallback.SearchCalls);
        Assert.Equal(CacheTtl.Geocode, Assert.Single(cache.Writes).Ttl);
        Assert.Equal("geocode:resolved:central park", cache.Writes[0].Key);
    }

    [Fact]
    public async Task SearchAsync_CachesEmptyResultsWithNegativeTtl()
    {
        var cache = new StubCache();
        var service = CreateService(
            cache,
            OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers),
            new StubProvider(MapProviders.GoogleMaps));

        Assert.Empty(await service.SearchAsync("nowhere", TestContext.Current.CancellationToken));
        Assert.Equal(CacheTtl.GeocodeNegative, Assert.Single(cache.Writes).Ttl);
    }

    [Fact]
    public async Task SearchAsync_FallsBackWhenSelectedProviderThrows()
    {
        var cache = new StubCache();
        var primary = new StubProvider(MapProviders.GoogleMaps, throws: true);
        var fallback = new StubProvider(MapProviders.OpenLayers, [Result]);
        var service = CreateService(cache, OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers), primary, fallback);

        Assert.Equal([Result], await service.SearchAsync("park", TestContext.Current.CancellationToken));
        Assert.Equal(1, fallback.SearchCalls);
    }

    [Fact]
    public async Task SearchAsync_FallsBackWhenSelectedProviderUnknown()
    {
        var cache = new StubCache();
        var fallback = new StubProvider(MapProviders.OpenLayers, [Result]);
        var service = CreateService(cache, OptionsFor("Mystery", MapProviders.OpenLayers), fallback);

        Assert.Equal([Result], await service.SearchAsync("park", TestContext.Current.CancellationToken));
        Assert.Equal(1, fallback.SearchCalls);
    }

    [Fact]
    public async Task SearchAsync_ThrowsWhenFallbackUnknownOrFailing()
    {
        var cache = new StubCache();
        var unknownFallback = CreateService(cache, OptionsFor("Mystery", "AlsoMystery"));
        var failingPrimary = new StubProvider(MapProviders.GoogleMaps, throws: true);
        var failingFallback = new StubProvider(MapProviders.OpenLayers, throws: true);
        var bothFailing = CreateService(
            cache,
            OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers),
            failingPrimary,
            failingFallback);

        await Assert.ThrowsAsync<LocationProviderUnavailableException>(() => unknownFallback.SearchAsync("park", TestContext.Current.CancellationToken));
        var exception = await Assert.ThrowsAsync<LocationProviderUnavailableException>(() => bothFailing.SearchAsync("park", TestContext.Current.CancellationToken));
        Assert.IsType<InvalidOperationException>(exception.InnerException);
    }

    [Fact]
    public async Task ReverseAsync_CacheHitAndCaching()
    {
        var cache = new StubCache();
        cache.Seed("geocode:resolved:reverse:40.7128:-74.0060", Result);
        var primary = new StubProvider(MapProviders.GoogleMaps, reverseResult: Result);
        var cachedService = CreateService(cache, OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers), primary);

        Assert.Equal(Result, await cachedService.ReverseAsync(Point, TestContext.Current.CancellationToken));
        Assert.Equal(0, primary.ReverseCalls);

        cache.Remove("geocode:resolved:reverse:40.7128:-74.0060");
        Assert.Equal(Result, await cachedService.ReverseAsync(Point, TestContext.Current.CancellationToken));
        Assert.Equal(CacheTtl.Geocode, cache.Writes[^1].Ttl);
    }

    [Fact]
    public async Task ReverseAsync_DoesNotCacheNullResult()
    {
        var cache = new StubCache();
        var service = CreateService(
            cache,
            OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers),
            new StubProvider(MapProviders.GoogleMaps));

        Assert.Null(await service.ReverseAsync(Point, TestContext.Current.CancellationToken));
        Assert.Empty(cache.Writes);
    }

    [Fact]
    public async Task ReverseAsync_FallsBackOnFailureAndThrowsWhenAllFail()
    {
        var cache = new StubCache();
        var primary = new StubProvider(MapProviders.GoogleMaps, throws: true);
        var fallback = new StubProvider(MapProviders.OpenLayers, reverseResult: Result);
        var withFallback = CreateService(cache, OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers), primary, fallback);

        Assert.Equal(Result, await withFallback.ReverseAsync(Point, TestContext.Current.CancellationToken));
        Assert.Equal(1, fallback.ReverseCalls);

        var unknown = CreateService(new StubCache(), OptionsFor("Mystery", "AlsoMystery"));
        await Assert.ThrowsAsync<LocationProviderUnavailableException>(() => unknown.ReverseAsync(Point, TestContext.Current.CancellationToken));

        var failingFallback = new StubProvider(MapProviders.OpenLayers, throws: true);
        var bothFailing = CreateService(
            new StubCache(),
            OptionsFor(MapProviders.GoogleMaps, MapProviders.OpenLayers),
            primary,
            failingFallback);
        await Assert.ThrowsAsync<LocationProviderUnavailableException>(() => bothFailing.ReverseAsync(Point, TestContext.Current.CancellationToken));
    }
}
