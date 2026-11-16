using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DealsSeeker.Api.Caching;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

namespace DealsSeeker.Api.Responses;

/// <summary>
/// Serves read responses with a validator, so that an unchanged representation is not transferred
/// and is not recomputed.
/// </summary>
/// <remarks>
/// <para>
/// The validator is derived from the representation itself, so it changes whenever the content
/// changes. The validator of the current representation is remembered, which allows a matching
/// conditional request to be answered before the underlying content is retrieved.
/// </para>
/// <para>
/// Responses that depend on the caller must use a cache key that includes the caller's identity,
/// so that one caller is never answered with another caller's representation.
/// </para>
/// </remarks>
public sealed class ConditionalResponseService(ICacheService cache, IOptions<JsonOptions> jsonOptions)
{
    private static readonly TimeSpan DefaultMaxAge = TimeSpan.FromSeconds(30);

    /// <summary>
    /// Answers a conditional request with 304 when the client already holds the current
    /// representation. Returns false when the caller must receive the content.
    /// </summary>
    public async Task<bool> TryNotModifiedAsync(
        string cacheKey,
        HttpContext httpContext,
        TimeSpan? maxAge = null,
        CancellationToken cancellationToken = default)
    {
        var etag = await cache.GetAsync<string>(cacheKey, cancellationToken);
        if (etag is null)
        {
            return false;
        }

        var ifNoneMatch = httpContext.Request.Headers.IfNoneMatch;
        if (!MatchesIfNoneMatch(ifNoneMatch, etag))
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status304NotModified;
        httpContext.Response.Headers.ETag = etag;
        httpContext.Response.Headers.CacheControl = BuildCacheControl(maxAge ?? DefaultMaxAge);
        return true;
    }

    /// <summary>
    /// Produces the response for a representation, including its validator.
    /// </summary>
    public IResult Respond<T>(T value, string cacheKey, HttpContext httpContext, TimeSpan? maxAge = null)
    {
        var serialized = JsonSerializer.Serialize(value, jsonOptions.Value.SerializerOptions);
        var etag = ComputeETag(serialized);
        var effectiveMaxAge = maxAge ?? DefaultMaxAge;

        cache.Set(cacheKey, etag, effectiveMaxAge);

        httpContext.Response.Headers.ETag = etag;
        httpContext.Response.Headers.CacheControl = BuildCacheControl(effectiveMaxAge);

        return Results.Text(serialized, "application/json; charset=utf8");
    }

    private static string BuildCacheControl(TimeSpan maxAge) =>
        $"private, max-age={Math.Max(0, (int)maxAge.TotalSeconds)}";

    /// <summary>
    /// Matches the validator of a conditional request against the current representation.
    /// </summary>
    /// <remarks>
    /// The header may carry several validators, may use the weak form, and may quote the value.
    /// The wildcard means "any current representation" and therefore always matches.
    /// </remarks>
    private static bool MatchesIfNoneMatch(StringValues ifNoneMatch, string etag)
    {
        var expected = etag.Trim().Trim('"');

        foreach (var headerValue in ifNoneMatch)
        {
            if (string.IsNullOrWhiteSpace(headerValue))
            {
                continue;
            }

            foreach (var candidate in headerValue.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
            {
                var trimmed = candidate.Trim();
                if (trimmed == "*")
                {
                    return true;
                }

                if (trimmed.StartsWith("W/", StringComparison.OrdinalIgnoreCase))
                {
                    trimmed = trimmed[2..].Trim();
                }

                if (string.Equals(trimmed.Trim('"'), expected, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
        }

        return false;
    }

    private static string ComputeETag(string serialized)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(serialized));
        return $"\"{Convert.ToHexString(hash)}\"";
    }
}
