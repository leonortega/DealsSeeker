using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Api;

public interface IDealsSeekerApiClient
{
    Task<SearchOffersResponse> SearchOffersAsync(SearchOffersRequest request, CancellationToken cancellationToken);

    Task<CommandResult> VoteOfferAvailabilityAsync(string offerId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken);

    Task<CommandResult> ReportOfferAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken);

    Task<OfferItemDto?> CreateOfferAsync(AddOfferRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<LocationSearchResultDto>> SearchLocationsAsync(string query, CancellationToken cancellationToken);

    Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken);

    Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken);
}
