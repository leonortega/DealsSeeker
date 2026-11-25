using System.Net;
using System.Text;
using DealsSeeker.Api.Caching;
using DealsSeeker.Api.Options;
using DealsSeeker.Api.Services.Locations;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace DealsSeeker.UnitTests.Services;

public class PhotonLocationLookupServiceTests
{
    private const string Features = """
        {"features":[{"geometry":{"coordinates":[-74.006,40.7128]},"properties":{"name":"Central Park","city":"New York"}}]}
        """;

    private static readonly GeoPoint Point = new(40.7128, -74.006);
    private static readonly LocationSearchResultDto Result = new("Central Park, New York", Point);

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

    private sealed class RecordingHandler(string body, HttpStatusCode status = HttpStatusCode.OK) : HttpMessageHandler
    {
        public List<Uri> Requests { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Requests.Add(request.RequestUri!);
            return Task.FromResult(new HttpResponseMessage(status)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            });
        }
    }

    private sealed class FailingHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            throw new HttpRequestException("photon down");
    }

    private static PhotonLocationLookupService CreateService(HttpMessageHandler handler, StubCache cache) =>
        new(
            new HttpClient(handler),
            cache,
            NullLogger<PhotonLocationLookupService>.Instance,
            Options.Create(new PhotonOptions
            {
                BaseUrl = "https://photon.komoot.io/api",
                UserAgent = "Test/1.0",
                MaxResults = 8
            }));

    [Fact]
    public async Task SearchAsync_BlankQuery_DoesNotCallPhoton()
    {
        var handler = new RecordingHandler(Features);
        var service = CreateService(handler, new StubCache());

        Assert.Empty(await service.SearchAsync("  ", TestContext.Current.CancellationToken));
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task SearchAsync_UsesPhotonSearchEndpointAndCachesResults()
    {
        var handler = new RecordingHandler(Features);
        var cache = new StubCache();
        var service = CreateService(handler, cache);

        var results = await service.SearchAsync("Central Park", TestContext.Current.CancellationToken);

        Assert.Equal([Result], results);
        var uri = Assert.Single(handler.Requests);
        Assert.Equal("photon.komoot.io", uri.Host);
        Assert.Equal("/api", uri.AbsolutePath);
        Assert.Contains("q=Central%20Park", uri.Query, StringComparison.Ordinal);
        Assert.Equal(CacheTtl.Geocode, Assert.Single(cache.Writes).Ttl);
        Assert.Equal("geocode:central park", cache.Writes[0].Key);
    }

    [Fact]
    public async Task SearchAsync_CacheHit_DoesNotCallPhoton()
    {
        var handler = new RecordingHandler(Features);
        var cache = new StubCache();
        cache.Seed<IReadOnlyList<LocationSearchResultDto>>("geocode:central park", [Result]);
        var service = CreateService(handler, cache);

        var results = await service.SearchAsync(" CENTRAL PARK ", TestContext.Current.CancellationToken);

        Assert.Equal([Result], results);
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task SearchAsync_CachesEmptyResultsWithNegativeTtl()
    {
        var handler = new RecordingHandler("{\"features\":[]}");
        var cache = new StubCache();
        var service = CreateService(handler, cache);

        Assert.Empty(await service.SearchAsync("nowhere", TestContext.Current.CancellationToken));
        Assert.Equal(CacheTtl.GeocodeNegative, Assert.Single(cache.Writes).Ttl);
    }

    [Fact]
    public async Task SearchAsync_Failure_ReportsProviderUnavailable()
    {
        var service = CreateService(new FailingHandler(), new StubCache());

        var exception = await Assert.ThrowsAsync<LocationProviderUnavailableException>(
            () => service.SearchAsync("park", TestContext.Current.CancellationToken));

        Assert.NotNull(exception.InnerException);
    }

    [Fact]
    public async Task ReverseAsync_UsesPhotonReverseEndpointAndCachesResult()
    {
        var handler = new RecordingHandler(Features);
        var cache = new StubCache();
        var service = CreateService(handler, cache);

        Assert.Equal(Result, await service.ReverseAsync(Point, TestContext.Current.CancellationToken));

        var uri = Assert.Single(handler.Requests);
        Assert.Equal("photon.komoot.io", uri.Host);
        Assert.Equal("/reverse", uri.AbsolutePath);
        Assert.Contains("lat=40.7128", uri.Query, StringComparison.Ordinal);
        Assert.Contains("lon=-74.006", uri.Query, StringComparison.Ordinal);
        Assert.Equal(CacheTtl.Geocode, Assert.Single(cache.Writes).Ttl);
        Assert.Equal("geocode:reverse:40.7128:-74.0060", cache.Writes[0].Key);
    }

    [Fact]
    public async Task ReverseAsync_CacheHit_DoesNotCallPhoton()
    {
        var handler = new RecordingHandler(Features);
        var cache = new StubCache();
        cache.Seed("geocode:reverse:40.7128:-74.0060", Result);
        var service = CreateService(handler, cache);

        Assert.Equal(Result, await service.ReverseAsync(Point, TestContext.Current.CancellationToken));
        Assert.Empty(handler.Requests);
    }

    [Fact]
    public async Task ReverseAsync_MissingResult_IsNotCached()
    {
        var handler = new RecordingHandler("{\"features\":[]}");
        var cache = new StubCache();
        var service = CreateService(handler, cache);

        Assert.Null(await service.ReverseAsync(Point, TestContext.Current.CancellationToken));
        Assert.Empty(cache.Writes);
    }

    [Fact]
    public async Task ReverseAsync_Failure_ReportsProviderUnavailable()
    {
        var service = CreateService(new FailingHandler(), new StubCache());

        await Assert.ThrowsAsync<LocationProviderUnavailableException>(
            () => service.ReverseAsync(Point, TestContext.Current.CancellationToken));
    }
}
