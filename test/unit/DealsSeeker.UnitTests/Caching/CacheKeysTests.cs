using DealsSeeker.Api.Caching;
using Xunit;

namespace DealsSeeker.UnitTests.Caching;

public class CacheKeysTests
{
    [Fact]
    public void ConstantKeys_AreStable()
    {
        Assert.Equal("promotions:active", CacheKeys.Promotions);
        Assert.Equal("offer:search-document", CacheKeys.OfferSearchDocument);
        Assert.Equal("tag-lexicon", CacheKeys.TagLexicon);
        Assert.Equal("geocode", CacheKeys.Geocode);
    }

    [Fact]
    public void KeyBuilders_ComposeExpectedKeys()
    {
        Assert.Equal("promotions:active", CacheKeys.PromotionsKey());
        Assert.Equal("offer:search-document:off-1", CacheKeys.OfferSearchDocumentKey("off-1"));
        Assert.Equal("tag-lexicon:en:coffee", CacheKeys.TagLexiconKey("en", "coffee"));
        Assert.Equal("geocode:GoogleMaps:central park", CacheKeys.GeocodeKey("GoogleMaps", "central park"));
        Assert.Equal("geocode:resolved:reverse:40.7128:-74.0060", CacheKeys.ReverseGeocodeKey("resolved", 40.7128, -74.006));
    }

    [Fact]
    public void TtlValues_ArePositiveAndOrdered()
    {
        Assert.All(
            new[] { CacheTtl.Promotions, CacheTtl.OfferSearchDocument, CacheTtl.TagLexicon, CacheTtl.Geocode, CacheTtl.GeocodeNegative },
            ttl => Assert.True(ttl > TimeSpan.Zero));

        Assert.True(CacheTtl.GeocodeNegative < CacheTtl.Geocode);
        Assert.Equal(TimeSpan.FromSeconds(30), CacheTtl.Promotions);
        Assert.Equal(TimeSpan.FromMinutes(10), CacheTtl.OfferSearchDocument);
        Assert.Equal(TimeSpan.FromHours(1), CacheTtl.TagLexicon);
        Assert.Equal(TimeSpan.FromHours(24), CacheTtl.Geocode);
        Assert.Equal(TimeSpan.FromMinutes(5), CacheTtl.GeocodeNegative);
    }
}
