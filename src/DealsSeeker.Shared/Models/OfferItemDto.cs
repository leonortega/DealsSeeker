namespace DealsSeeker.Shared.Models;

public sealed record OfferItemDto(
    string OfferId,
    string BusinessId,
    string BusinessName,
    string Description,
    IReadOnlyList<string> Tags,
    string ImageUrl,
    bool IsActive,
    GeoPoint Location,
    double DistanceMeters,
    int PositiveAvailabilityCount,
    int NegativeAvailabilityCount);
