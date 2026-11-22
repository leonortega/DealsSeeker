using System.Net;
using DealsSeeker.IntegrationTests;
using Xunit;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// OWASP Top 10 A05:2021 — Security Misconfiguration.
/// Verifies the CORS boundary and error representation, and records two
/// configuration gaps as skipped tests so they stay visible until fixed.
/// </summary>
public class OwaspSecurityMisconfigurationTests(ApiFactory factory) : SecurityTestBase(factory)
{
    [Fact]
    public async Task CorsPreflight_FromAllowedOrigin_IsPermitted()
    {
        using var client = CreateClient();
        using var request = Preflight("http://localhost:8081");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal("http://localhost:8081", response.Headers.GetValues("Access-Control-Allow-Origin").First());
        Assert.Contains("authorization", string.Join(",", response.Headers.GetValues("Access-Control-Allow-Headers")), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CorsPreflight_FromUnknownOrigin_IsNotReflected()
    {
        using var client = CreateClient();
        using var request = Preflight("http://evil.example");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task ValidationError_UsesProblemDetailsContentType()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "", email = NewEmail("a05"), password = "short" }), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact(Skip = "Gap: the API emits no X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy or HSTS header. Enable after a spec-first change adds security headers.")]
    public async Task Responses_IncludeSecurityHeaders()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Get("/health/live"), TestContext.Current.CancellationToken);

        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").First());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").First());
        Assert.False(string.IsNullOrWhiteSpace(response.Headers.GetValues("Content-Security-Policy").FirstOrDefault()));
        Assert.Equal("no-referrer", response.Headers.GetValues("Referrer-Policy").First());
        Assert.False(string.IsNullOrWhiteSpace(response.Headers.GetValues("Strict-Transport-Security").FirstOrDefault()));
    }

    [Fact(Skip = "Gap: malformed JSON in Development is rendered by the developer exception page and includes a stack trace. Enable once binding failures use a production-like error handler.")]
    public async Task MalformedJson_DoesNotLeakStackTrace()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/auth/register", "{"), TestContext.Current.CancellationToken);

        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.DoesNotContain("System.", body, StringComparison.Ordinal);
        Assert.DoesNotContain("at Microsoft.AspNetCore", body, StringComparison.Ordinal);
    }

    private static HttpRequestMessage Preflight(string origin)
    {
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/account/me");
        request.Headers.TryAddWithoutValidation("Origin", origin);
        request.Headers.TryAddWithoutValidation("Access-Control-Request-Method", "GET");
        request.Headers.TryAddWithoutValidation("Access-Control-Request-Headers", "authorization");
        return request;
    }
}
