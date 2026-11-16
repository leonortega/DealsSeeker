using DealsSeeker.Shared.Models;

namespace DealsSeeker.Shared.Contracts.Offers;

public sealed record SearchOffersResponse(
    IReadOnlyList<OfferItemDto> Offers,
    IReadOnlyList<BusinessMarkerDto> Businesses,
    int Page = 1,
    int PageSize = 20,
    bool HasMore = false);
