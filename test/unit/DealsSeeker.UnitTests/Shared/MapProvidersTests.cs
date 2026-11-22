using DealsSeeker.Shared.Configuration;
using Xunit;

namespace DealsSeeker.UnitTests.Shared;

public class MapProvidersTests
{
    [Theory]
    [InlineData("GoogleMaps", MapProviders.GoogleMaps)]
    [InlineData("  googlemaps ", MapProviders.GoogleMaps)]
    [InlineData("GOOGLEMAPS", MapProviders.GoogleMaps)]
    [InlineData("OpenLayers", MapProviders.OpenLayers)]
    [InlineData(" openlayers ", MapProviders.OpenLayers)]
    [InlineData("", "")]
    [InlineData("   ", "")]
    [InlineData("unknown", "")]
    public void Normalize_ReturnsCanonicalNameOrEmpty(string? provider, string expected)
    {
        Assert.Equal(expected, MapProviders.Normalize(provider));
    }

    [Fact]
    public void Normalize_ReturnsEmpty_WhenProviderIsNull()
    {
        Assert.Equal(string.Empty, MapProviders.Normalize(null));
    }
}
