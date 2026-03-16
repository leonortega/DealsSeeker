namespace DealsSeeker.Mobile.Services.Api;

public sealed class ApiSettings
{
    public string BaseUrl { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_API_BASEURL") ?? GetDefaultBaseUrl();

    public string GoogleMapsApiKey { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_GOOGLE_MAPS_API_KEY") ?? string.Empty;

    public string MapDisplayProvider { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_DISPLAY_PROVIDER")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER")
        ?? "GoogleMaps";

    public string MapDisplayProviderFallback { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_DISPLAY_PROVIDER_FALLBACK")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER_FALLBACK")
        ?? "OpenLayers";

    public string MapRedirectProvider { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_REDIRECT_PROVIDER")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER")
        ?? "GoogleMaps";

    public string MapRedirectProviderFallback { get; init; } =
        Environment.GetEnvironmentVariable("DEALSEEKER_MAP_REDIRECT_PROVIDER_FALLBACK")
        ?? Environment.GetEnvironmentVariable("DEALSEEKER_MAP_PROVIDER_FALLBACK")
        ?? "OpenLayers";

        private static string GetDefaultBaseUrl()
        {
    #if ANDROID
        return "http://10.0.2.2:5005";
    #else
        return "http://localhost:5005";
    #endif
        }
}
