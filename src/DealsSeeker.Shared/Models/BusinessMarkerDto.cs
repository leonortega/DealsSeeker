namespace DealsSeeker.Shared.Models;

public sealed record BusinessMarkerDto(
    string BusinessId,
    string Name,
    GeoPoint Location,
    double DistanceMeters);

