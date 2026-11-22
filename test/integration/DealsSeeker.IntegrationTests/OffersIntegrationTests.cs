using System.Net;
using System.Net.Http.Json;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public class OffersIntegrationTests(ApiFactory factory) : IntegrationTestBase(factory)
{
    private static readonly GeoPoint NearCafe = new(40.7131, -74.0055);

    private static SearchOffersRequest Search(string query = "", bool favoritesOnly = false) =>
        new(query, NearCafe, 1000, "en", favoritesOnly);

    private static AddOfferRequest NewOffer(string description = "Cheap coffee nearby") => new(
        description,
        ["coffee", "sale"],
        [new OfferImageDto("gallery", "image/jpeg", 1, null, null, 0, null, "data:image/jpeg;base64,abc")],
        new OfferLocationDto("manual-confirmed", "My Cafe", new GeoPoint(40.7132, -74.0056)));

    [Fact]
    public async Task Search_WithoutToken_ReturnsUnauthorized()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(HttpMethod.Post, "/api/offers/search", Search()), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Search_WithSeededData_ReturnsOffersAndBusinessMarkers()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client);

        var response = await client.SendAsync(Json(HttpMethod.Post, "/api/offers/search", Search(), session.AccessToken), TestContext.Current.CancellationToken);
        var result = await response.Content.ReadFromJsonAsync<SearchOffersResponse>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(result!.Offers, offer => offer.OfferId == "off-100");
        Assert.NotEmpty(result.Businesses);
    }

    [Theory]
    [InlineData("coffee", "off-100")]
    [InlineData("bakery", "off-101")]
    [InlineData("tea", "off-102")]
    public async Task Search_MatchesSmartQueryTerms(string query, string expectedOfferId)
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client);

        var response = await client.SendAsync(Json(HttpMethod.Post, "/api/offers/search", Search(query), session.AccessToken), TestContext.Current.CancellationToken);
        var result = await response.Content.ReadFromJsonAsync<SearchOffersResponse>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Contains(result!.Offers, offer => offer.OfferId == expectedOfferId);
    }

    [Fact]
    public async Task Search_InvalidPageSize_ReturnsValidationProblem()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client);

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/search",
            Search() with { PageSize = 0 },
            session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("pageSize", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateUpdateAndDeleteOwnedOffer()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "owner@example.com");

        var created = await client.SendAsync(Json(HttpMethod.Post, "/api/offers", NewOffer(), session.AccessToken), TestContext.Current.CancellationToken);
        var offer = await created.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        Assert.NotNull(offer);

        var owned = await (await client.SendAsync(Get("/api/account/offers", session.AccessToken), TestContext.Current.CancellationToken))
            .Content.ReadFromJsonAsync<List<OfferItemDto>>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Contains(owned!, item => item.OfferId == offer!.OfferId);

        var draft = await client.SendAsync(Get($"/api/account/offers/{offer!.OfferId}", session.AccessToken), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, draft.StatusCode);

        var updated = await client.SendAsync(Json(
            HttpMethod.Put,
            $"/api/offers/{offer.OfferId}",
            NewOffer("Updated offer text"),
            session.AccessToken), TestContext.Current.CancellationToken);
        var updatedOffer = await updated.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
        Assert.Equal("Updated offer text", updatedOffer!.Description);

        var deleted = await client.SendAsync(Json(
            HttpMethod.Delete,
            $"/api/offers/{offer.OfferId}",
            new { },
            session.AccessToken), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, deleted.StatusCode);

        var afterDelete = await client.SendAsync(Get($"/api/account/offers/{offer.OfferId}", session.AccessToken), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NotFound, afterDelete.StatusCode);
    }

    [Fact]
    public async Task AnotherUserCannotUpdateOrDeleteOffer()
    {
        using var client = CreateClient();
        var owner = await RegisterAndLoginAsync(client, "owner2@example.com");
        var created = await client.SendAsync(Json(HttpMethod.Post, "/api/offers", NewOffer(), owner.AccessToken), TestContext.Current.CancellationToken);
        var offer = (await created.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: TestContext.Current.CancellationToken))!;
        var other = await RegisterAndLoginAsync(client, "other@example.com");

        var update = await client.SendAsync(Json(
            HttpMethod.Put,
            $"/api/offers/{offer.OfferId}",
            NewOffer("hijack"),
            other.AccessToken), TestContext.Current.CancellationToken);
        var delete = await client.SendAsync(Json(
            HttpMethod.Delete,
            $"/api/offers/{offer.OfferId}",
            new { },
            other.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, update.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, delete.StatusCode);
    }

    [Fact]
    public async Task FavoriteAndAvailabilityVoteAreReflectedInSearch()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "votes@example.com");

        var favorite = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-100/favorite",
            new SetFavoriteRequest(true),
            session.AccessToken), TestContext.Current.CancellationToken);
        var vote = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-100/availability",
            new OfferAvailabilityVoteRequest(OfferAvailabilityVoteType.ThumbsUp),
            session.AccessToken), TestContext.Current.CancellationToken);
        var favoritesOnly = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/search",
            Search(favoritesOnly: true),
            session.AccessToken), TestContext.Current.CancellationToken);
        var result = await favoritesOnly.Content.ReadFromJsonAsync<SearchOffersResponse>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, favorite.StatusCode);
        Assert.Equal(HttpStatusCode.OK, vote.StatusCode);
        Assert.Contains(result!.Offers, offer => offer.OfferId == "off-100" && offer.IsFavorite);
    }

    [Fact]
    public async Task FavoriteOnMissingOffer_ReturnsNotFound()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "missing@example.com");

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-missing/favorite",
            new SetFavoriteRequest(true),
            session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ReportOffer_ReturnsOkAndUnknownOfferReturnsNotFound()
    {
        using var client = CreateClient();

        var ok = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-100/report",
            new ReportOfferRequest("spam")), TestContext.Current.CancellationToken);
        var missing = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/offers/off-missing/report",
            new ReportOfferRequest("spam")), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }
}
