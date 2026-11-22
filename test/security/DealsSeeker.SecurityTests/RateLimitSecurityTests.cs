using System.Globalization;
using System.Net;
using System.Text.Json;
using DealsSeeker.IntegrationTests;
using Xunit;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// Rate-limiting edge cases derived from APP.RATE.LIMIT.001, including the
/// tighter search policy and the "rejected request performs no work" rule.
/// Each test uses its own factory so the rate limiter state cannot leak between
/// tests (a deliberately exhausted allowance lasts for the whole window).
/// </summary>
public class RateLimitSecurityTests(ApiFactory factory) : SecurityTestBase(factory)
{
    [Fact]
    public async Task ExceededSearchAllowance_Returns429WithRetryAfterAndProblemDetails()
    {
        using var localFactory = new ApiFactory();
        using var client = localFactory.CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("ratelimit-search"));
        var body = SearchBody();

        string? retryAfter = null;
        string? responseBody = null;
        var throttled = false;

        for (var attempt = 0; attempt < 65; attempt += 1)
        {
            using var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/offers/search", body, session.AccessToken), TestContext.Current.CancellationToken);
            if (response.StatusCode != HttpStatusCode.TooManyRequests)
            {
                continue;
            }

            throttled = true;
            retryAfter = response.Headers.TryGetValues("Retry-After", out var values) ? values.FirstOrDefault() : null;
            responseBody = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
            break;
        }

        Assert.True(throttled, "The search allowance was never exhausted.");
        Assert.False(string.IsNullOrWhiteSpace(retryAfter));
        Assert.True(int.TryParse(retryAfter, NumberStyles.Integer, CultureInfo.InvariantCulture, out var seconds));
        Assert.True(seconds > 0);
        Assert.Contains("\"type\"", responseBody, StringComparison.Ordinal);
        Assert.Contains("\"title\"", responseBody, StringComparison.Ordinal);
        Assert.Contains("\"status\":429", responseBody, StringComparison.Ordinal);
        Assert.Contains("\"detail\"", responseBody, StringComparison.Ordinal);
        Assert.DoesNotContain("\"errors\"", responseBody, StringComparison.Ordinal);
    }

    [Fact]
    public async Task SearchAllowanceExhaustion_DoesNotBlockCheapAuthenticatedEndpoint()
    {
        using var localFactory = new ApiFactory();
        using var client = localFactory.CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("ratelimit-policy"));
        var body = SearchBody();

        var searchThrottled = false;
        for (var attempt = 0; attempt < 65; attempt += 1)
        {
            using var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/offers/search", body, session.AccessToken), TestContext.Current.CancellationToken);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                searchThrottled = true;
                break;
            }
        }

        var profile = await client.SendAsync(Get("/api/account/me", session.AccessToken), TestContext.Current.CancellationToken);

        Assert.True(searchThrottled);
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
    }

    [Fact]
    public async Task RateLimitedWrite_PerformsNoWork()
    {
        using var localFactory = new ApiFactory();
        using var client = localFactory.CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("ratelimit-write"));

        var exhausted = false;
        for (var attempt = 0; attempt < 320; attempt += 1)
        {
            using var response = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                exhausted = true;
                break;
            }
        }

        var before = await CountForAsync(localFactory, "offers");
        var create = await client.SendAsync(Json(
            HttpMethod.Post, "/api/offers", AddOfferBody("Must not be created"), session.AccessToken), TestContext.Current.CancellationToken);
        var after = await CountForAsync(localFactory, "offers");

        Assert.True(exhausted, "The global allowance was never exhausted.");
        Assert.Equal(HttpStatusCode.TooManyRequests, create.StatusCode);
        Assert.Equal(before, after);
    }

    private static string SearchBody() => JsonSerializer.Serialize(new
    {
        query = "coffee",
        userLocation = new { lat = 40.7131, lng = -74.0055 },
        radiusMeters = 1000,
        page = 1,
        pageSize = 20
    });
}
