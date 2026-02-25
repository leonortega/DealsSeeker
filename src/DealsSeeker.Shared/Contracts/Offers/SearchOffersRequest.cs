using DealsSeeker.Shared.Models;

namespace DealsSeeker.Shared.Contracts.Offers;

public sealed record SearchOffersRequest(
    string Query,
    GeoPoint UserLocation,
    int RadiusMeters = 1000);

