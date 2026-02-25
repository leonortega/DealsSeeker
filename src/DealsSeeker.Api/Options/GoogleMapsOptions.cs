namespace DealsSeeker.Api.Options;

public sealed class GoogleMapsOptions
{
    public const string SectionName = "GoogleMaps";

    public string ApiKey { get; init; } = string.Empty;

    public string GeocodingBaseUrl { get; init; } = "https://maps.googleapis.com/maps/api/geocode/json";
}

