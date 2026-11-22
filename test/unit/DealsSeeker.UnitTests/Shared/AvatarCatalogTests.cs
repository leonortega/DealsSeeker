using DealsSeeker.Shared.Avatars;
using Xunit;

namespace DealsSeeker.UnitTests.Shared;

public class AvatarCatalogTests
{
    [Fact]
    public void Options_ContainsTenUniqueAvatars_IncludingDefault()
    {
        Assert.Equal(10, AvatarCatalog.Options.Count);
        Assert.Equal(AvatarCatalog.DefaultAvatarId, AvatarCatalog.Options[0].AvatarId);
        Assert.Equal(
            AvatarCatalog.Options.Count,
            AvatarCatalog.Options.Select(option => option.AvatarId).Distinct(StringComparer.OrdinalIgnoreCase).Count());
    }

    [Theory]
    [InlineData(null, false)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("smile", true)]
    [InlineData("  SmIlE  ", true)]
    [InlineData("ROCKET", true)]
    [InlineData("unknown", false)]
    public void IsValid_HandlesCaseWhitespaceAndUnknown(string? avatarId, bool expected)
    {
        Assert.Equal(expected, AvatarCatalog.IsValid(avatarId));
    }

    [Theory]
    [InlineData("smile", "smile")]
    [InlineData("  cat  ", "cat")]
    [InlineData("ROBOT", "ROBOT")]
    [InlineData(null, AvatarCatalog.DefaultAvatarId)]
    [InlineData("   ", AvatarCatalog.DefaultAvatarId)]
    [InlineData("nope", AvatarCatalog.DefaultAvatarId)]
    public void Normalize_ReturnsTrimmedValidIdOrDefault(string? avatarId, string expected)
    {
        Assert.Equal(expected, AvatarCatalog.Normalize(avatarId));
    }
}
