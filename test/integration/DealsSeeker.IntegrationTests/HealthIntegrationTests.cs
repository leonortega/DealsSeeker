using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public class HealthIntegrationTests(ApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task LiveEndpoint_ReturnsOk()
    {
        using var client = CreateClient();

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/live", TestContext.Current.CancellationToken)).StatusCode);
    }

    [Fact]
    public async Task ReadyEndpoint_ReturnsHealthyReport()
    {
        using var client = CreateClient();

        var response = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("Healthy", body, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("self", body, StringComparison.OrdinalIgnoreCase);
    }
}
