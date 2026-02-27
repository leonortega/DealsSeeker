namespace DealsSeeker.Api.Options;

public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public int SessionTtlHours { get; init; } = 72;
}
