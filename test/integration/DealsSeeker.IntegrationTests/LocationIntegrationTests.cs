using System.Net;
using System.Net.Http.Json;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public class LocationIntegrationTests : IntegrationTestBase, IClassFixture<LocationApiFactory>
{
    private readonly LocationApiFactory _factory;

    public LocationIntegrationTests(LocationApiFactory factory) : base(factory)
    {
        _factory = factory;
        factory.Lookup.Reset();
    }

    [Fact]
    public async Task Search_BlankQuery_ReturnsEmptyList()
    {
        using var client = CreateClient();

        var response = await client.GetAsync("/api/locations/search?query=%20%20", TestContext.Current.CancellationToken);
        var results = await response.Content.ReadFromJsonAsync<List<LocationSearchResultDto>>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(results!);
        Assert.Equal(0, _factory.Lookup.SearchCalls);
    }

    [Fact]
    public async Task Search_ReturnsProviderResults()
    {
        _factory.Lookup.SearchResults = [new LocationSearchResultDto("Central Park", new GeoPoint(40.7, -74.0))];
        using var client = CreateClient();

        var response = await client.GetAsync("/api/locations/search?query=Central%20Park", TestContext.Current.CancellationToken);
        var results = await response.Content.ReadFromJsonAsync<List<LocationSearchResultDto>>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(results!);
        Assert.Equal("Central Park", results![0].Label);
    }

    [Fact]
    public async Task Search_SupportsConditionalRequests()
    {
        using var client = CreateClient();
        var first = await client.GetAsync("/api/locations/search?query=park", TestContext.Current.CancellationToken);
        var etag = first.Headers.TryGetValues("ETag", out var values) ? values.FirstOrDefault() : null;
        Assert.False(string.IsNullOrWhiteSpace(etag));

        using var conditional = new HttpRequestMessage(HttpMethod.Get, "/api/locations/search?query=park");
        conditional.Headers.TryAddWithoutValidation("If-None-Match", etag);
        var second = await client.SendAsync(conditional, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotModified, second.StatusCode);
    }

    [Fact]
    public async Task Search_TooLongQuery_ReturnsBadRequest()
    {
        using var client = CreateClient();
        var query = new string('x', 201);

        var response = await client.GetAsync($"/api/locations/search?query={query}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Search_ProviderOutage_ReturnsServiceUnavailable()
    {
        _factory.Lookup.ThrowOnSearch = true;
        using var client = CreateClient();

        var response = await client.GetAsync("/api/locations/search?query=park", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task Reverse_ReturnsResultOrNotFound()
    {
        _factory.Lookup.ReverseResult = new LocationSearchResultDto("Central Park", new GeoPoint(40.7, -74.0));
        using var client = CreateClient();

        var found = await client.GetAsync("/api/locations/reverse?lat=40.7&lng=-74", TestContext.Current.CancellationToken);
        _factory.Lookup.ReverseResult = null;
        var missing = await client.GetAsync("/api/locations/reverse?lat=40.7&lng=-74", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, found.StatusCode);
        Assert.Equal("Central Park", (await found.Content.ReadFromJsonAsync<LocationSearchResultDto>(cancellationToken: TestContext.Current.CancellationToken))!.Label);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Theory]
    [InlineData("91", "-74")]
    [InlineData("40.7", "181")]
    public async Task Reverse_InvalidCoordinates_ReturnsBadRequest(string lat, string lng)
    {
        using var client = CreateClient();

        var response = await client.GetAsync($"/api/locations/reverse?lat={lat}&lng={lng}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
