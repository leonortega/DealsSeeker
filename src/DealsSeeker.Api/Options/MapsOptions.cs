namespace DealsSeeker.Api.Options;

public sealed class MapsOptions
{
    public const string SectionName = "Maps";

    public string Provider { get; init; } = "OpenLayers";

    public string FallbackProvider { get; init; } = "GoogleMaps";
}
