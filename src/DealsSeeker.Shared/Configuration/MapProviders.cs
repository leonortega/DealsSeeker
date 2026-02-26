namespace DealsSeeker.Shared.Configuration;

public static class MapProviders
{
    public const string GoogleMaps = "GoogleMaps";
    public const string OpenLayers = "OpenLayers";

    public static string Normalize(string? provider) =>
        provider?.Trim() switch
        {
            { Length: > 0 } p when p.Equals(GoogleMaps, StringComparison.OrdinalIgnoreCase) => GoogleMaps,
            { Length: > 0 } p when p.Equals(OpenLayers, StringComparison.OrdinalIgnoreCase) => OpenLayers,
            _ => string.Empty
        };
}
