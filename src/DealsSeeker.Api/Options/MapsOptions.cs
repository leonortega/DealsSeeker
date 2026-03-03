namespace DealsSeeker.Api.Options;

public sealed class MapsOptions
{
    public const string SectionName = "Maps";

    // Preferred settings for in-app map rendering and location lookups.
    public string DisplayProvider { get; init; } = "OpenLayers";
    public string DisplayFallbackProvider { get; init; } = "GoogleMaps";

    // Preferred settings for navigation redirects (offer/marker click).
    public string RedirectProvider { get; init; } = "OpenLayers";
    public string RedirectFallbackProvider { get; init; } = "GoogleMaps";

    // Backward-compatible keys.
    public string Provider { get; init; } = string.Empty;
    public string FallbackProvider { get; init; } = string.Empty;

    public string ResolveDisplayProvider() =>
        string.IsNullOrWhiteSpace(DisplayProvider) ? Provider : DisplayProvider;

    public string ResolveDisplayFallbackProvider() =>
        string.IsNullOrWhiteSpace(DisplayFallbackProvider) ? FallbackProvider : DisplayFallbackProvider;

    public string ResolveRedirectProvider() =>
        string.IsNullOrWhiteSpace(RedirectProvider) ? Provider : RedirectProvider;

    public string ResolveRedirectFallbackProvider() =>
        string.IsNullOrWhiteSpace(RedirectFallbackProvider) ? FallbackProvider : RedirectFallbackProvider;
}
