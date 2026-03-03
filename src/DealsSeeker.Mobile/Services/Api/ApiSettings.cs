namespace DealsSeeker.Mobile.Services.Api;

public sealed class ApiSettings
{
    public string BaseUrl { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_API_BASEURL") ?? "https://localhost:7132";

    public string MapDisplayProvider { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_DISPLAY_PROVIDER")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER")
        ?? "OpenLayers";

    public string MapDisplayProviderFallback { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_DISPLAY_PROVIDER_FALLBACK")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER_FALLBACK")
        ?? "GoogleMaps";

    public string MapRedirectProvider { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_REDIRECT_PROVIDER")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER")
        ?? "OpenLayers";

    public string MapRedirectProviderFallback { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_REDIRECT_PROVIDER_FALLBACK")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER_FALLBACK")
        ?? "GoogleMaps";
}
