namespace DealsSeeker.Shared.Contracts.AddOffer;

public sealed record AddOfferRequest(
    string Description,
    IReadOnlyList<string> Tags,
    IReadOnlyList<OfferImageDto> Images,
    OfferLocationDto? Location);
