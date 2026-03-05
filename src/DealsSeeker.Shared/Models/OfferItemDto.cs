namespace DealsSeeker.Shared.Models;

public sealed record OfferItemDto(
    string OfferId,
    string BusinessId,
    string BusinessName,
    string Description,
    IReadOnlyList<string> Tags,
    string ImageUrl,
    IReadOnlyList<string> ImageUrls,
    bool IsActive,
    bool IsPromoted,
    bool IsFavorite,
    bool IsReported,
    double RelevanceScore,
    IReadOnlyList<string> MatchStrategies,
    GeoPoint Location,
    double DistanceMeters,
    int PositiveAvailabilityCount,
    int NegativeAvailabilityCount,
    bool HasCurrentUserVoted);
