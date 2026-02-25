using DealsSeeker.Shared.Models;

namespace DealsSeeker.Shared.Contracts.AddOffer;

public sealed record LocationSearchResultDto(
    string Label,
    GeoPoint Position);

