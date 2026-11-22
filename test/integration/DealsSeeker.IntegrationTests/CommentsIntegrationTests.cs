using System.Net;
using System.Net.Http.Json;
using DealsSeeker.Shared.Contracts.Comments;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public class CommentsIntegrationTests(ApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task PublishAndListComments()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "commenter@example.com");

        var published = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-100/comments",
            new CreateCommentRequest("First comment"),
            session.AccessToken), TestContext.Current.CancellationToken);
        var comment = await published.Content.ReadFromJsonAsync<OfferCommentDto>(cancellationToken: TestContext.Current.CancellationToken);

        var listed = await client.SendAsync(Get("/api/offers/off-100/comments?limit=10", session.AccessToken), TestContext.Current.CancellationToken);
        var page = await listed.Content.ReadFromJsonAsync<OfferCommentsResponseDto>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, published.StatusCode);
        Assert.Equal("First comment", comment!.Body);
        Assert.Equal(HttpStatusCode.OK, listed.StatusCode);
        Assert.Contains(page!.Comments, item => item.Body == "First comment");
    }

    [Fact]
    public async Task Comments_RequireAuthentication()
    {
        using var client = CreateClient();

        var list = await client.SendAsync(Get("/api/offers/off-100/comments"), TestContext.Current.CancellationToken);
        var publish = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-100/comments",
            new CreateCommentRequest("hi")), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, list.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, publish.StatusCode);
    }

    [Fact]
    public async Task Comments_ValidateLimitAndCursor()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "limits@example.com");

        var badLimit = await client.SendAsync(Get("/api/offers/off-100/comments?limit=0", session.AccessToken), TestContext.Current.CancellationToken);
        var badCursor = await client.SendAsync(Get("/api/offers/off-100/comments?after=not-base64!", session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, badLimit.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, badCursor.StatusCode);
    }

    [Fact]
    public async Task Comments_SecondPageUsesCursor()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "paging@example.com");
        for (var i = 0; i < 3; i++)
        {
            await client.SendAsync(Json(
                HttpMethod.Post,
                "/api/offers/off-100/comments",
                new CreateCommentRequest($"comment {i}"),
                session.AccessToken), TestContext.Current.CancellationToken);
        }

        var first = await (await client.SendAsync(Get("/api/offers/off-100/comments?limit=1", session.AccessToken), TestContext.Current.CancellationToken))
            .Content.ReadFromJsonAsync<OfferCommentsResponseDto>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Single(first!.Comments);
        Assert.True(first.HasMore);
        Assert.False(string.IsNullOrWhiteSpace(first.NextCursor));

        var second = await (await client.SendAsync(Get($"/api/offers/off-100/comments?limit=1&after={Uri.EscapeDataString(first.NextCursor!)}", session.AccessToken), TestContext.Current.CancellationToken))
            .Content.ReadFromJsonAsync<OfferCommentsResponseDto>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Single(second!.Comments);
        Assert.NotEqual(first.Comments[0].CommentId, second.Comments[0].CommentId);
    }

    [Fact]
    public async Task Comments_SupportConditionalRequests()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "conditional@example.com");

        var first = await client.SendAsync(Get("/api/offers/off-100/comments", session.AccessToken), TestContext.Current.CancellationToken);
        var etag = first.Headers.TryGetValues("ETag", out var values) ? values.FirstOrDefault() : null;
        Assert.False(string.IsNullOrWhiteSpace(etag));

        using var conditional = new HttpRequestMessage(HttpMethod.Get, "/api/offers/off-100/comments");
        conditional.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", session.AccessToken);
        conditional.Headers.TryAddWithoutValidation("If-None-Match", etag);

        Assert.Equal(HttpStatusCode.NotModified, (await client.SendAsync(conditional, TestContext.Current.CancellationToken)).StatusCode);
    }

    [Fact]
    public async Task PublishComment_ToMissingOffer_ReturnsNotFound()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "missing-comment@example.com");

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-missing/comments",
            new CreateCommentRequest("hi"),
            session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
