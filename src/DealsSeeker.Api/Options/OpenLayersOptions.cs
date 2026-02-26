namespace DealsSeeker.Api.Options;

public sealed class OpenLayersOptions
{
    public const string SectionName = "OpenLayers";

    public string GeocodingBaseUrl { get; init; } = "https://photon.komoot.io/api";

    public string FallbackGeocodingBaseUrl { get; init; } = string.Empty;

    public string UserAgent { get; init; } = "DealsSeeker/1.0";

    public int MaxResults { get; init; } = 8;
}
