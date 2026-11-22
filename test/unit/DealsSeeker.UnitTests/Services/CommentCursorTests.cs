using DealsSeeker.Api.Services.Comments;
using Xunit;

namespace DealsSeeker.UnitTests.Services;

public class CommentCursorTests
{
    [Fact]
    public void Encode_ProducesBase64OfTimestampAndId()
    {
        var encoded = CommentCursor.Encode("2026-11-19T07:30:15Z", "c-1");

        Assert.Equal("MjAyNi0xMS0xOVQwNzozMDoxNVp8Yy0x", encoded);
    }

    [Theory]
    [InlineData(null, true)]
    [InlineData("", true)]
    [InlineData("   ", true)]
    [InlineData("MjAyNi0xMS0xOVQwNzozMDoxNVp8Yy0x", true)]
    [InlineData("not-base64!", false)]
    [InlineData("bm8tc2VwYXJhdG9y", false)]
    public void IsValid_ValidatesAbsentAndEncodedCursors(string? cursor, bool expected)
    {
        Assert.Equal(expected, CommentCursor.IsValid(cursor));
    }

    [Fact]
    public void IsValid_RejectsMissingIdAfterSeparator()
    {
        var payload = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("2026-11-19|"));

        Assert.False(CommentCursor.IsValid(payload));
    }

    [Fact]
    public void RoundTrip_CursorRemainsValid()
    {
        Assert.True(CommentCursor.IsValid(CommentCursor.Encode("2026-01-01T00:00:00Z", "comment-42")));
    }
}
