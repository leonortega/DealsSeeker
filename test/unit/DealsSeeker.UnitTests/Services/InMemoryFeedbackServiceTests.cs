using DealsSeeker.Api.Services.Feedback;
using DealsSeeker.Api.Services.Offers;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using Xunit;

namespace DealsSeeker.UnitTests.Services;

public class InMemoryFeedbackServiceTests
{
    private sealed class StubOfferService(CommandResult reportResult) : IOfferService
    {
        public int ReportCalls { get; private set; }
        public string? ReportedOfferId { get; private set; }
        public ReportOfferRequest? ReportedRequest { get; private set; }

        public Task<CommandResult> ReportAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken)
        {
            ReportCalls++;
            ReportedOfferId = offerId;
            ReportedRequest = request;
            return Task.FromResult(reportResult);
        }

        public Task<SearchOffersResponse> SearchAsync(SearchOffersRequest request, string userId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<IReadOnlyList<OfferItemDto>> GetOwnedOffersAsync(string userId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<AddOfferRequest?> GetOwnedOfferDraftAsync(string offerId, string userId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<CommandResult> VoteAvailabilityAsync(string offerId, string userId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<CommandResult> SetFavoriteAsync(string offerId, string userId, SetFavoriteRequest request, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<OfferItemDto> AddAsync(AddOfferRequest request, string userId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<OfferItemDto?> UpdateAsync(string offerId, AddOfferRequest request, string userId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<CommandResult> DeleteAsync(string offerId, string userId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
    }

    [Fact]
    public async Task SubmitSuggestionAsync_RejectsBlankAndAcceptsMessage()
    {
        var service = new InMemoryFeedbackService(new StubOfferService(new CommandResult(true, "ok")));

        var blank = await service.SubmitSuggestionAsync(new SuggestionRequest(" ", null), TestContext.Current.CancellationToken);
        var ok = await service.SubmitSuggestionAsync(new SuggestionRequest("More deals please", null), TestContext.Current.CancellationToken);

        Assert.False(blank.Success);
        Assert.True(ok.Success);
    }

    [Fact]
    public async Task SubmitReportAsync_RejectsBlankMessage()
    {
        var offerService = new StubOfferService(new CommandResult(true, "ok"));
        var service = new InMemoryFeedbackService(offerService);

        var result = await service.SubmitReportAsync(new ReportRequest(" ", null, null), TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Equal(0, offerService.ReportCalls);
    }

    [Fact]
    public async Task SubmitReportAsync_WithoutOfferId_DoesNotCallOfferService()
    {
        var offerService = new StubOfferService(new CommandResult(true, "ok"));
        var service = new InMemoryFeedbackService(offerService);

        var result = await service.SubmitReportAsync(new ReportRequest("  spam  ", "  ", "  usr-1  "), TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        Assert.Equal(0, offerService.ReportCalls);
    }

    [Fact]
    public async Task SubmitReportAsync_WithOfferId_ForwardsTrimmedValues()
    {
        var offerService = new StubOfferService(new CommandResult(true, "Report registered."));
        var service = new InMemoryFeedbackService(offerService);

        var result = await service.SubmitReportAsync(new ReportRequest("  spam  ", "  off-1  "), TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        Assert.Equal("off-1", offerService.ReportedOfferId);
        Assert.Equal("spam", offerService.ReportedRequest!.Reason);
    }

    [Fact]
    public async Task SubmitReportAsync_PropagatesOfferServiceFailure()
    {
        var failure = new CommandResult(false, "Offer not found.");
        var service = new InMemoryFeedbackService(new StubOfferService(failure));

        var result = await service.SubmitReportAsync(new ReportRequest("spam", "off-1"), TestContext.Current.CancellationToken);

        Assert.Equal(failure, result);
    }
}
