using Microsoft.AspNetCore.Mvc;

namespace DealsSeeker.Api.Responses;

/// <summary>
/// The standard error responses of the API, in the RFC 7807 shape.
/// </summary>
public static class ApiResults
{
    /// <summary>
    /// A validation failure: 400 with the field-level failures in the <c>errors</c> member.
    /// </summary>
    public static IResult ValidationProblem(IDictionary<string, string[]> errors) =>
        Results.Problem(
            title: "One or more validation errors occurred.",
            detail: "The request payload did not satisfy the declared limits.",
            statusCode: StatusCodes.Status400BadRequest,
            extensions: new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase)
            {
                ["errors"] = errors
            });

    /// <summary>
    /// The caller exceeded its request allowance: 429 with a <c>Retry-After</c> header.
    /// </summary>
    public static IResult RateLimited(TimeSpan retryAfter)
    {
        var retryAfterSeconds = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds));
        return new RateLimitedResult(retryAfterSeconds);
    }

    /// <summary>
    /// Every configured location provider failed: 503.
    /// </summary>
    public static IResult ProviderUnavailable(string detail) =>
        Results.Problem(
            title: "The location provider is unavailable.",
            detail: detail,
            statusCode: StatusCodes.Status503ServiceUnavailable);
}

/// <summary>A 429 response that carries a <c>Retry-After</c> header.</summary>
public sealed class RateLimitedResult(int retryAfterSeconds) : IResult
{
    public Task ExecuteAsync(HttpContext httpContext)
    {
        httpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        httpContext.Response.Headers.RetryAfter = retryAfterSeconds.ToString();

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Too many requests.",
            Detail = "The request allowance has been exceeded. Retry after the indicated delay.",
            Type = "https://tools.ietf.org/html/rfc6585#section-4"
        };

        httpContext.Response.ContentType = "application/problem+json";
        return httpContext.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: "application/problem+json",
            cancellationToken: httpContext.RequestAborted);
    }
}
