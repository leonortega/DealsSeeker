using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Api.Services.Offers;

public interface IOfferService
{
    Task<SearchOffersResponse> SearchAsync(SearchOffersRequest request, string userId, CancellationToken cancellationToken);

    Task<CommandResult> VoteAvailabilityAsync(string offerId, string userId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken);

    Task<CommandResult> ReportAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken);

    Task<CommandResult> SetFavoriteAsync(string offerId, string userId, SetFavoriteRequest request, CancellationToken cancellationToken);

    Task<OfferItemDto> AddAsync(AddOfferRequest request, CancellationToken cancellationToken);
}
