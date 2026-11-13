namespace DealsSeeker.Shared.Avatars;

/// <summary>
/// A selectable preset avatar shown next to user authored content.
/// </summary>
public sealed record AvatarOption(string AvatarId, string Emoji);

public static class AvatarCatalog
{
    public const string DefaultAvatarId = "smile";

    public static readonly IReadOnlyList<AvatarOption> Options = new[]
    {
        new AvatarOption("smile", "🙂"),
        new AvatarOption("cat", "🐱"),
        new AvatarOption("dog", "🐶"),
        new AvatarOption("fox", "🦊"),
        new AvatarOption("panda", "🐼"),
        new AvatarOption("rocket", "🚀"),
        new AvatarOption("star", "⭐"),
        new AvatarOption("robot", "🤖"),
        new AvatarOption("alien", "👽"),
        new AvatarOption("ghost", "👻"),
    };

    public static bool IsValid(string? avatarId) =>
        !string.IsNullOrWhiteSpace(avatarId) &&
        Options.Any(option => string.Equals(option.AvatarId, avatarId.Trim(), StringComparison.OrdinalIgnoreCase));

    public static string Normalize(string? avatarId) =>
        IsValid(avatarId) ? avatarId!.Trim() : DefaultAvatarId;
}
