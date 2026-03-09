using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Api;

public interface IDealsSeekerApiClient
{
    Task<CommandResult> RegisterUserAsync(RegisterUserRequest request, CancellationToken cancellationToken);

    Task<AuthSessionDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken);

    Task<CommandResult> LogoutAsync(CancellationToken cancellationToken);

    Task<UserProfileDto?> GetMyProfileAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<OfferItemDto>?> GetMyOffersAsync(CancellationToken cancellationToken);

    Task<AddOfferRequest?> GetMyOfferDraftAsync(string offerId, CancellationToken cancellationToken);

    Task<SearchOffersResponse> SearchOffersAsync(SearchOffersRequest request, CancellationToken cancellationToken);

    Task<CommandResult> VoteOfferAvailabilityAsync(string offerId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken);

    Task<CommandResult> ReportOfferAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken);

    Task<CommandResult> SetOfferFavoriteAsync(string offerId, SetFavoriteRequest request, CancellationToken cancellationToken);

    Task<OfferItemDto?> CreateOfferAsync(AddOfferRequest request, CancellationToken cancellationToken);

    Task<OfferItemDto?> UpdateOfferAsync(string offerId, AddOfferRequest request, CancellationToken cancellationToken);

    Task<CommandResult> DeleteOfferAsync(string offerId, CancellationToken cancellationToken);

    Task<IReadOnlyList<LocationSearchResultDto>> SearchLocationsAsync(string query, CancellationToken cancellationToken);

    Task<LocationSearchResultDto?> ReverseLocationAsync(GeoPoint point, CancellationToken cancellationToken);

    Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken);

    Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken);
}
