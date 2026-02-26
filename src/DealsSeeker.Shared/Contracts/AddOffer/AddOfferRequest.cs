namespace DealsSeeker.Shared.Contracts.AddOffer;

public sealed record AddOfferRequest(
    string Description,
    IReadOnlyList<string> Tags,
    OfferImageDto? Image,
    OfferLocationDto? Location,
    string? ImageDataUrl = null);
