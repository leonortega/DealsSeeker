using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Api.Services.Offers;

public interface IOfferService
{
    Task<SearchOffersResponse> SearchAsync(SearchOffersRequest request, CancellationToken cancellationToken);

    Task<CommandResult> VoteAvailabilityAsync(string offerId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken);

    Task<CommandResult> ReportAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken);

    Task<OfferItemDto> AddAsync(AddOfferRequest request, CancellationToken cancellationToken);
}

