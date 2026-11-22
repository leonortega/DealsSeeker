using System.Net;
using System.Text;
using DealsSeeker.Api.Options;
using DealsSeeker.Api.Services.Locations;
using DealsSeeker.IntegrationTests;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// OWASP Top 10 A10:2021 — Server-Side Request Forgery.
/// The geocoding providers are the only outbound-HTTP surface: user input must
/// stay an encoded query value and must never be able to choose the host.
/// </summary>
public class OwaspSsrfTests(LocationApiFactory factory) : IClassFixture<LocationApiFactory>
{
    private const string SsrfPayload = "http://169.254.169.254/latest/meta-data/iam/security-credentials";

    [Fact]
    public async Task GoogleProvider_EncodesUserInputAndKeepsConfiguredHost()
    {
        var handler = new RecordingHandler("{\"results\":[]}");
        using var http = new HttpClient(handler);
        var service = new GoogleMapsLocationLookupService(
            http,
            Options.Create(new GoogleMapsOptions { ApiKey = "test-key" }),
            NullLogger<GoogleMapsLocationLookupService>.Instance);

        await service.SearchAsync(SsrfPayload, CancellationToken.None);

        var uri = Assert.Single(handler.Requests);
        Assert.Equal("maps.googleapis.com", uri.Host);
        Assert.Contains(Uri.EscapeDataString(SsrfPayload), uri.Query, StringComparison.Ordinal);
        Assert.DoesNotContain("169.254.169.254", uri.Host, StringComparison.Ordinal);
    }

    [Fact]
    public async Task OpenLayersProvider_EncodesUserInputAndKeepsConfiguredHost()
    {
        var handler = new RecordingHandler("{\"features\":[]}");
        using var http = new HttpClient(handler);
        var service = new OpenLayersLocationLookupService(
            http,
            NullLogger<OpenLayersLocationLookupService>.Instance,
            Options.Create(new OpenLayersOptions
            {
                GeocodingBaseUrl = "https://photon.komoot.io/api",
                UserAgent = "OwaspTest/1.0"
            }));

        await service.SearchAsync(SsrfPayload, CancellationToken.None);

        var uri = Assert.Single(handler.Requests);
        Assert.Equal("photon.komoot.io", uri.Host);
        Assert.Contains(Uri.EscapeDataString(SsrfPayload), uri.Query, StringComparison.Ordinal);
        Assert.DoesNotContain("169.254.169.254", uri.Host, StringComparison.Ordinal);
    }

    [Fact]
    public async Task LocationSearch_WithSsrfPayload_DoesNotFailOrCallOtherHosts()
    {
        factory.Lookup.Reset();
        using var client = factory.CreateClient();

        var response = await client.GetAsync($"/api/locations/search?query={Uri.EscapeDataString(SsrfPayload)}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, factory.Lookup.SearchCalls);
    }

    [Fact]
    public async Task LocationSearch_OverlongQuery_IsRejectedBeforeCallingProvider()
    {
        factory.Lookup.Reset();
        using var client = factory.CreateClient();
        var query = new string('x', 201);

        var response = await client.GetAsync($"/api/locations/search?query={query}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0, factory.Lookup.SearchCalls);
    }

    private sealed class RecordingHandler(string responseBody) : HttpMessageHandler
    {
        public List<Uri> Requests { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Requests.Add(request.RequestUri!);
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(responseBody, Encoding.UTF8, "application/json")
            });
        }
    }
}
