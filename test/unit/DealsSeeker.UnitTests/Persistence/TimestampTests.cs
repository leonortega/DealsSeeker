using DealsSeeker.Api.Persistence;
using Xunit;

namespace DealsSeeker.UnitTests.Persistence;

public class TimestampTests
{
    [Fact]
    public void FormatUtc_ConvertsToUtcWithFixedOffsetAndConstantWidth()
    {
        var value = new DateTimeOffset(2026, 11, 19, 10, 30, 15, TimeSpan.FromHours(3)).AddTicks(1_234_567);

        var formatted = Timestamp.FormatUtc(value);

        Assert.Equal("2026-11-19T07:30:15.1234567+00:00", formatted);
    }

    [Fact]
    public void NowUtc_UsesCanonicalFormat()
    {
        var formatted = Timestamp.NowUtc();

        Assert.EndsWith("+00:00", formatted);
        Assert.True(Timestamp.TryParse(formatted, out _));
    }

    [Theory]
    [InlineData("2026-11-19T07:30:15.1234567+00:00", true)]
    [InlineData("2026-11-19T07:30:15Z", true)]
    [InlineData(null, false)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("not-a-date", false)]
    public void TryParse_HandlesValidAndInvalidValues(string? value, bool expected)
    {
        Assert.Equal(expected, Timestamp.TryParse(value, out _));
    }

    [Fact]
    public void TryParse_ReturnsParsedUtcValue()
    {
        Assert.True(Timestamp.TryParse("2026-11-19T07:30:15+00:00", out var parsed));
        Assert.Equal(new DateTimeOffset(2026, 11, 19, 7, 30, 15, TimeSpan.Zero), parsed.ToUniversalTime());
    }
}
