using DealsSeeker.Shared.Models;

namespace DealsSeeker.Shared.Contracts.AddOffer;

public sealed record OfferLocationDto(
    string Source,
    string? Label,
    GeoPoint Position);

