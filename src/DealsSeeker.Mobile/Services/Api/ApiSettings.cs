namespace DealsSeeker.Mobile.Services.Api;

public sealed class ApiSettings
{
    public string BaseUrl { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_API_BASEURL") ?? "https://localhost:7132";

    public string MapProvider { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER") ?? "OpenLayers";

    public string MapProviderFallback { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER_FALLBACK") ?? "GoogleMaps";
}
