using System.Net;
using System.Net.Http.Json;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public class FeedbackIntegrationTests(ApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task SubmitSuggestion_ReturnsOk()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/suggestions",
            new SuggestionRequest("Please add more deals", "a@b.co")), TestContext.Current.CancellationToken);
        var result = await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result!.Success);
    }

    [Fact]
    public async Task SubmitSuggestion_EmptyMessage_ReturnsBadRequest()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/suggestions",
            new SuggestionRequest(" ", null)), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SubmitReport_ReturnsOk()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/reports",
            new ReportRequest("Inaccurate offer", "off-100", "usr-1")), TestContext.Current.CancellationToken);
        var result = await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result!.Success);
    }

    [Fact]
    public async Task ComplaintAlias_BehavesLikeReport()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/complaints",
            new ReportRequest("Duplicate offer", null)), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task SubmitReport_WithMissingOffer_ReturnsBadRequest()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/reports",
            new ReportRequest("Offer missing", "off-does-not-exist")), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task SubmitReport_EmptyMessage_ReturnsBadRequest()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/reports",
            new ReportRequest(" ", null)), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
