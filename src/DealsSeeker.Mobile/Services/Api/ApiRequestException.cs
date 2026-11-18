using System.Net;

namespace DealsSeeker.Mobile.Services.Api;

/// <summary>
/// Describes a non-success API response together with the standard error object returned by the API.
/// Mirrors APP.VALIDATION.001, APP.RATE.LIMIT.001 and APP.LOCATION.PROVIDER.RESILIENCE.001.
/// </summary>
public sealed class ApiRequestException : Exception
{
    public ApiRequestException(
        HttpStatusCode statusCode,
        string message,
        TimeSpan? retryAfter = null,
        IReadOnlyDictionary<string, string[]>? fieldErrors = null)
        : base(message)
    {
        StatusCode = statusCode;
        RetryAfter = retryAfter;
        FieldErrors = fieldErrors ?? new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);
    }

    public HttpStatusCode StatusCode { get; }

    public TimeSpan? RetryAfter { get; }

    public IReadOnlyDictionary<string, string[]> FieldErrors { get; }

    public bool IsRateLimited => (int)StatusCode == 429;

    public bool IsValidationFailure => StatusCode == HttpStatusCode.BadRequest;

    public bool IsServiceUnavailable => (int)StatusCode == 503;

    public bool IsUnauthorized => StatusCode == HttpStatusCode.Unauthorized;
}
