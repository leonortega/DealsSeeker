namespace DealsSeeker.Api.Validation;

/// <summary>
/// Field-level validation failures for a request payload.
/// </summary>
public static class ValidationErrors
{
    public static Dictionary<string, string[]> For(string field, params string[] messages) =>
        new(StringComparer.OrdinalIgnoreCase) { [field] = messages };
}

/// <summary>
/// The declared limits of the request contracts, enforced before any work is performed.
/// </summary>
public static class RequestLimits
{
    public const int MaxRadiusMeters = 50_000;
    public const int MaxQueryLength = 200;
    public const int MaxSearchPageSize = 50;
    public const int DefaultSearchPageSize = 20;
    public const int MaxCommentBodyLength = 2000;
    public const int MaxCommentLimit = 100;
    public const int DefaultCommentLimit = 20;
    public const int MaxTags = 10;
    public const int MaxTagLength = 40;
    public const int MaxImages = 5;
    public const int MaxDescriptionLength = 2000;
    public const int MaxDisplayNameLength = 80;
    public const int MaxEmailLength = 254;
    public const int MinPasswordLength = 8;
    public const int MaxPasswordLength = 200;
    public const int MaxReasonLength = 500;
    public const int MaxMessageLength = 2000;
    public const int MaxContactLength = 254;
    public const int MaxLocationQueryLength = 200;
    public const int MaxImageDataUrlLength = 2_000_000;
}
