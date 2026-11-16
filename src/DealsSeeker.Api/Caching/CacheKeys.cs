namespace DealsSeeker.Api.Caching;

/// <summary>
/// The cache keys and time-to-live values used by the application.
/// </summary>
public static class CacheKeys
{
    public const string Promotions = "promotions:active";
    public const string OfferSearchDocument = "offer:search-document";
    public const string TagLexicon = "tag-lexicon";
    public const string Geocode = "geocode";

    public static string PromotionsKey() => Promotions;

    public static string OfferSearchDocumentKey(string offerId) => $"{OfferSearchDocument}:{offerId}";

    public static string TagLexiconKey(string locale, string normalizedQuery) => $"{TagLexicon}:{locale}:{normalizedQuery}";

    public static string GeocodeKey(string provider, string normalizedQuery) => $"{Geocode}:{provider}:{normalizedQuery}";

    public static string ReverseGeocodeKey(string provider, double lat, double lng) =>
        $"{Geocode}:{provider}:reverse:{lat:F4}:{lng:F4}";
}

/// <summary>The time-to-live values used by the application.</summary>
public static class CacheTtl
{
    public static readonly TimeSpan Promotions = TimeSpan.FromSeconds(30);
    public static readonly TimeSpan OfferSearchDocument = TimeSpan.FromMinutes(10);
    public static readonly TimeSpan TagLexicon = TimeSpan.FromHours(1);
    public static readonly TimeSpan Geocode = TimeSpan.FromHours(24);
    public static readonly TimeSpan GeocodeNegative = TimeSpan.FromMinutes(5);
}
