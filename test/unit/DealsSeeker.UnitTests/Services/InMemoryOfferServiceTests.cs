using DealsSeeker.Api.Services.Offers;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using Xunit;

namespace DealsSeeker.UnitTests.Services;

public class InMemoryOfferServiceTests
{
    private static readonly GeoPoint NearCafe = new(40.7131, -74.0055);

    private static SearchOffersRequest Search(
        string query = "",
        GeoPoint? location = null,
        int radius = 1000,
        bool favoritesOnly = false) =>
        new(query, location ?? NearCafe, radius, "en", favoritesOnly);

    private static AddOfferRequest NewOffer(string description = "Cheap coffee", string[]? tags = null) =>
        new(
            description,
            tags ?? ["coffee"],
            [new OfferImageDto("gallery", "image/jpeg", 1, null, null, 0, null, "data:image/jpeg;base64,abc")],
            new OfferLocationDto("manual-confirmed", "My Cafe", new GeoPoint(40.7132, -74.0056)));

    [Fact]
    public async Task SearchAsync_PreSearch_ReturnsSeededOffersWithPromotedFirst()
    {
        var service = new InMemoryOfferService();

        var response = await service.SearchAsync(Search(), "usr-1", TestContext.Current.CancellationToken);

        Assert.Equal(3, response.Offers.Count);
        Assert.Equal("off-100", response.Offers[0].OfferId);
        Assert.True(response.Offers[0].IsPromoted);
        Assert.Equal(3, response.Businesses.Count);
        Assert.True(response.Businesses[0].DistanceMeters <= response.Businesses[^1].DistanceMeters);
    }

    [Theory]
    [InlineData("coffee", "off-100")]
    [InlineData("cafe", "off-100")]
    [InlineData("cofee", "off-100")]
    [InlineData("bakery", "off-101")]
    [InlineData("tea", "off-102")]
    public async Task SearchAsync_MatchesExactSynonymAndFuzzyTerms(string query, string expectedOfferId)
    {
        var service = new InMemoryOfferService();

        var response = await service.SearchAsync(Search(query), "usr-1", TestContext.Current.CancellationToken);

        Assert.Contains(response.Offers, offer => offer.OfferId == expectedOfferId);
    }

    [Fact]
    public async Task SearchAsync_UnmatchedQuery_ReturnsEmpty()
    {
        var service = new InMemoryOfferService();

        var response = await service.SearchAsync(Search("spaceship"), "usr-1", TestContext.Current.CancellationToken);

        Assert.Empty(response.Offers);
        Assert.Empty(response.Businesses);
    }

    [Fact]
    public async Task SearchAsync_AppliesRadiusAndFavoritesFilters()
    {
        var service = new InMemoryOfferService();
        var far = new GeoPoint(48.8566, 2.3522);

        Assert.Empty((await service.SearchAsync(Search("", far), "usr-1", TestContext.Current.CancellationToken)).Offers);
        Assert.Empty((await service.SearchAsync(Search(favoritesOnly: true), "usr-1", TestContext.Current.CancellationToken)).Offers);

        await service.SetFavoriteAsync("off-100", "usr-1", new SetFavoriteRequest(true), TestContext.Current.CancellationToken);
        var favoriteResult = await service.SearchAsync(Search(favoritesOnly: true), "usr-1", TestContext.Current.CancellationToken);

        Assert.Single(favoriteResult.Offers);
        Assert.True(favoriteResult.Offers[0].IsFavorite);
    }

    [Fact]
    public async Task SearchAsync_DemotesReportedOffers()
    {
        var service = new InMemoryOfferService();
        await service.ReportAsync("off-100", new ReportOfferRequest("spam"), TestContext.Current.CancellationToken);

        var response = await service.SearchAsync(Search(), "usr-1", TestContext.Current.CancellationToken);

        Assert.False(response.Offers[0].IsReported);
        Assert.Equal("off-100", response.Offers[^1].OfferId);
        Assert.True(response.Offers[^1].IsReported);
    }

    [Fact]
    public async Task VoteAvailabilityAsync_UpdatesCountsAndRejectsDuplicate()
    {
        var service = new InMemoryOfferService();
        var up = new OfferAvailabilityVoteRequest(OfferAvailabilityVoteType.ThumbsUp);

        var first = await service.VoteAvailabilityAsync("off-100", "usr-1", up, TestContext.Current.CancellationToken);
        var duplicate = await service.VoteAvailabilityAsync("off-100", "usr-1", up, TestContext.Current.CancellationToken);
        var down = await service.VoteAvailabilityAsync("off-100", "usr-2", new OfferAvailabilityVoteRequest(OfferAvailabilityVoteType.ThumbsDown), TestContext.Current.CancellationToken);
        var offer = (await service.SearchAsync(Search("coffee"), "usr-1", TestContext.Current.CancellationToken)).Offers[0];

        Assert.True(first.Success);
        Assert.False(duplicate.Success);
        Assert.True(down.Success);
        Assert.Equal(1, offer.PositiveAvailabilityCount);
        Assert.Equal(1, offer.NegativeAvailabilityCount);
        Assert.True(offer.HasCurrentUserVoted);
    }

    [Fact]
    public async Task VoteAvailabilityAsync_RejectsBlankUserAndMissingOffer()
    {
        var service = new InMemoryOfferService();
        var vote = new OfferAvailabilityVoteRequest(OfferAvailabilityVoteType.ThumbsUp);

        Assert.False((await service.VoteAvailabilityAsync("off-100", " ", vote, TestContext.Current.CancellationToken)).Success);
        Assert.False((await service.VoteAvailabilityAsync("missing", "usr-1", vote, TestContext.Current.CancellationToken)).Success);
    }

    [Fact]
    public async Task ReportAsync_IncrementsCountOrRejectsMissingOffer()
    {
        var service = new InMemoryOfferService();
        var request = new ReportOfferRequest("spam");

        Assert.False((await service.ReportAsync("missing", request, TestContext.Current.CancellationToken)).Success);
        Assert.True((await service.ReportAsync("off-100", request, TestContext.Current.CancellationToken)).Success);
        Assert.True((await service.SearchAsync(Search("coffee"), "usr-1", TestContext.Current.CancellationToken)).Offers[0].IsReported);
    }

    [Fact]
    public async Task SetFavoriteAsync_ValidatesAndToggles()
    {
        var service = new InMemoryOfferService();

        Assert.False((await service.SetFavoriteAsync("off-100", " ", new SetFavoriteRequest(true), TestContext.Current.CancellationToken)).Success);
        Assert.False((await service.SetFavoriteAsync("missing", "usr-1", new SetFavoriteRequest(true), TestContext.Current.CancellationToken)).Success);
        Assert.True((await service.SetFavoriteAsync("off-100", "usr-1", new SetFavoriteRequest(true), TestContext.Current.CancellationToken)).Success);
        Assert.True((await service.SetFavoriteAsync("off-100", "usr-1", new SetFavoriteRequest(false), TestContext.Current.CancellationToken)).Success);
        Assert.Empty((await service.SearchAsync(Search(favoritesOnly: true), "usr-1", TestContext.Current.CancellationToken)).Offers);
    }

    [Fact]
    public async Task AddAsync_NormalizesTagsAndUsesPlaceholderImage()
    {
        var service = new InMemoryOfferService();
        var request = NewOffer("Cheap Cafe", [" Café ", "coffee", "CAFE", "  "]) with { Images = [] };

        var created = await service.AddAsync(request, "usr-1", TestContext.Current.CancellationToken);

        Assert.StartsWith("off-", created.OfferId);
        Assert.Equal(["cafe", "coffee"], created.Tags);
        Assert.Equal("/images/offer-placeholder.svg", created.ImageUrl);
        Assert.Single(created.ImageUrls);
        Assert.Equal("My Cafe", created.BusinessName);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.AddAsync(request, " ", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task AddAsync_UsesDefaultLocation_WhenMissing()
    {
        var service = new InMemoryOfferService();
        var request = NewOffer() with { Location = null, Images = [] };

        var created = await service.AddAsync(request, "usr-1", TestContext.Current.CancellationToken);

        Assert.Equal(40.7128, created.Location.Lat);
        Assert.Equal(-74.0060, created.Location.Lng);
        Assert.Equal("User Submitted Business", created.BusinessName);
    }

    [Fact]
    public async Task GetOwnedOffersAndDraft_ReturnOnlyOwnedData()
    {
        var service = new InMemoryOfferService();
        Assert.Empty(await service.GetOwnedOffersAsync("usr-1", TestContext.Current.CancellationToken));

        var created = await service.AddAsync(NewOffer(), "usr-1", TestContext.Current.CancellationToken);
        var owned = await service.GetOwnedOffersAsync("usr-1", TestContext.Current.CancellationToken);
        var draft = await service.GetOwnedOfferDraftAsync(created.OfferId, "usr-1", TestContext.Current.CancellationToken);
        var otherDraft = await service.GetOwnedOfferDraftAsync(created.OfferId, "usr-2", TestContext.Current.CancellationToken);

        Assert.Single(owned);
        Assert.Equal(created.OfferId, owned[0].OfferId);
        Assert.NotNull(draft);
        Assert.Equal("manual-confirmed", draft.Location!.Source);
        Assert.Null(await service.GetOwnedOfferDraftAsync("missing", "usr-1", TestContext.Current.CancellationToken));
        Assert.Null(otherDraft);
    }

    [Fact]
    public async Task UpdateAsync_RequiresOwner()
    {
        var service = new InMemoryOfferService();
        var created = await service.AddAsync(NewOffer(), "usr-1", TestContext.Current.CancellationToken);
        var request = NewOffer("Updated offer", ["coffee", "sale"]);

        Assert.Null(await service.UpdateAsync(created.OfferId, request, " ", TestContext.Current.CancellationToken));
        Assert.Null(await service.UpdateAsync(created.OfferId, request, "usr-2", TestContext.Current.CancellationToken));
        Assert.Null(await service.UpdateAsync("missing", request, "usr-1", TestContext.Current.CancellationToken));

        var updated = await service.UpdateAsync(created.OfferId, request, "usr-1", TestContext.Current.CancellationToken);
        Assert.NotNull(updated);
        Assert.Equal("Updated offer", updated.Description);
        Assert.Equal(["coffee", "sale"], updated.Tags);
    }

    [Fact]
    public async Task DeleteAsync_RequiresOwnerAndCleansUpReferences()
    {
        var service = new InMemoryOfferService();
        var created = await service.AddAsync(NewOffer(), "usr-1", TestContext.Current.CancellationToken);
        await service.SetFavoriteAsync(created.OfferId, "usr-2", new SetFavoriteRequest(true), TestContext.Current.CancellationToken);
        await service.VoteAvailabilityAsync(created.OfferId, "usr-2", new OfferAvailabilityVoteRequest(OfferAvailabilityVoteType.ThumbsUp), TestContext.Current.CancellationToken);

        Assert.False((await service.DeleteAsync(created.OfferId, " ", TestContext.Current.CancellationToken)).Success);
        Assert.False((await service.DeleteAsync(created.OfferId, "usr-2", TestContext.Current.CancellationToken)).Success);
        Assert.True((await service.DeleteAsync(created.OfferId, "usr-1", TestContext.Current.CancellationToken)).Success);
        Assert.Empty(await service.GetOwnedOffersAsync("usr-1", TestContext.Current.CancellationToken));
        Assert.Empty((await service.SearchAsync(Search(favoritesOnly: true), "usr-2", TestContext.Current.CancellationToken)).Offers);
    }
}
