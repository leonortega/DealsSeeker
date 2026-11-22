using System.Net;
using DealsSeeker.IntegrationTests;
using Xunit;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// Input validation and injection edge cases derived from APP.VALIDATION.001.
/// </summary>
public class InputValidationSecurityTests(ApiFactory factory) : SecurityTestBase(factory)
{
    [Theory]
    [InlineData("{")]
    [InlineData("not json")]
    [InlineData("{\"displayName\":}")]
    public async Task MalformedJson_ReturnsBadRequest(string body)
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/auth/register", body), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UnsupportedContentType_ReturnsUnsupportedMediaType()
    {
        using var client = CreateClient();
        var body = JsonBody(new { displayName = "Text", email = NewEmail("content-type"), password = "password1" });

        var response = await client.SendAsync(Raw(
            HttpMethod.Post, "/api/auth/register", body, contentType: "text/plain"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }

    [Fact]
    public async Task SearchLimits_EnforceDeclaredBoundaries()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("search-boundary"));

        var cases = new (string? Query, int Radius, int Page, int PageSize, HttpStatusCode Expected)[]
        {
            (new string('q', 200), 1000, 1, 20, HttpStatusCode.OK),
            (new string('q', 201), 1000, 1, 20, HttpStatusCode.BadRequest),
            ("coffee", 50_000, 1, 20, HttpStatusCode.OK),
            ("coffee", 50_001, 1, 20, HttpStatusCode.BadRequest),
            ("coffee", 1000, 0, 20, HttpStatusCode.BadRequest),
            ("coffee", 1000, 1, 50, HttpStatusCode.OK),
            ("coffee", 1000, 1, 51, HttpStatusCode.BadRequest),
        };

        foreach (var (query, radius, page, pageSize, expected) in cases)
        {
            var body = JsonBody(new
            {
                query,
                userLocation = new { lat = 40.7131, lng = -74.0055 },
                radiusMeters = radius,
                page,
                pageSize
            });

            var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/offers/search", body, session.AccessToken), TestContext.Current.CancellationToken);

            Assert.Equal(expected, response.StatusCode);
        }
    }

    [Theory]
    [InlineData(90, -180, HttpStatusCode.OK)]
    [InlineData(-90, 180, HttpStatusCode.OK)]
    [InlineData(90.0001, 0, HttpStatusCode.BadRequest)]
    [InlineData(-90.0001, 0, HttpStatusCode.BadRequest)]
    [InlineData(0, 180.0001, HttpStatusCode.BadRequest)]
    [InlineData(0, -180.0001, HttpStatusCode.BadRequest)]
    [InlineData(40.7128123456789, -74.0059123456789, HttpStatusCode.OK)]
    public async Task SearchCoordinates_EnforceGeographicRange(double lat, double lng, HttpStatusCode expected)
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("coord-boundary"));
        var body = JsonBody(new
        {
            query = "coffee",
            userLocation = new { lat, lng },
            radiusMeters = 1000,
            page = 1,
            pageSize = 20
        });

        var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/offers/search", body, session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task AddOfferLimits_EnforceDeclaredBoundaries()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("offer-boundary"));
        var validTags = Enumerable.Range(0, 10).Select(i => $"tag{i}").ToArray();
        var tooManyTags = Enumerable.Range(0, 11).Select(i => $"tag{i}").ToArray();

        var cases = new (string Description, string[] Tags, HttpStatusCode Expected)[]
        {
            (new string('d', 2000), ["coffee"], HttpStatusCode.Created),
            (new string('d', 2001), ["coffee"], HttpStatusCode.BadRequest),
            ("Coffee deal", validTags, HttpStatusCode.Created),
            ("Coffee deal", tooManyTags, HttpStatusCode.BadRequest),
            ("Coffee deal", [new string('t', 40)], HttpStatusCode.Created),
            ("Coffee deal", [new string('t', 41)], HttpStatusCode.BadRequest),
        };

        foreach (var (description, tags, expected) in cases)
        {
            var response = await client.SendAsync(Json(
                HttpMethod.Post, "/api/offers", AddOfferBody(description, tags), session.AccessToken), TestContext.Current.CancellationToken);

            Assert.Equal(expected, response.StatusCode);
        }
    }

    [Fact]
    public async Task OversizedImageDataUrl_IsRejected()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("image-boundary"));
        var body = JsonBody(new
        {
            description = "Coffee deal",
            tags = new[] { "coffee" },
            images = new[]
            {
                new
                {
                    source = "data",
                    mimeType = "image/png",
                    sizeBytes = 1L,
                    width = 1,
                    height = 1,
                    order = 0,
                    fileName = "big.png",
                    dataUrl = new string('A', 2_000_001)
                }
            },
            location = (object?)null
        });

        var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/offers", body, session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("' OR 1=1 --")]
    [InlineData("'; DROP TABLE offers; --")]
    [InlineData("coffee' UNION SELECT email, password_hash FROM users --")]
    [InlineData("\"><script>alert(1)</script>")]
    public async Task InjectionStrings_AreTreatedAsData(string query)
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("injection"));
        var body = JsonBody(new
        {
            query,
            userLocation = new { lat = 40.7131, lng = -74.0055 },
            radiusMeters = 1000,
            page = 1,
            pageSize = 20
        });

        var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/offers/search", body, session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(await CountAsync("offers") >= 3);
        Assert.True(await CountAsync("users") > 0);
    }

    [Fact]
    public async Task XssPayloads_AreStoredAsDataAndDoNotFailRequests()
    {
        using var client = CreateClient();
        const string payload = "<script>alert('xss')</script>";
        var session = await RegisterAndLoginAsync(client, NewEmail("xss"), payload);

        var profile = await client.SendAsync(Get("/api/account/me", session.AccessToken), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        Assert.True((await profile.Content.ReadAsStringAsync(TestContext.Current.CancellationToken)).Contains(payload, StringComparison.Ordinal));

        var created = await client.SendAsync(Json(
            HttpMethod.Post, "/api/offers", AddOfferBody(payload), session.AccessToken), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var offerId = OfferIdFrom(await created.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));

        var comment = await client.SendAsync(Json(
            HttpMethod.Post,
            $"/api/offers/{offerId}/comments",
            new { body = "<img src=x onerror=alert(1)>" },
            session.AccessToken), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, comment.StatusCode);

        var storedDescription = await ScalarAsync<string>(
            "SELECT description FROM offers WHERE offer_id = @OfferId",
            new { OfferId = offerId });
        Assert.Equal(payload, storedDescription);
    }

    [Fact]
    public async Task ValidationFailure_PerformsNoWork()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("no-work"));
        var offersBefore = await CountAsync("offers");
        var usersBefore = await CountAsync("users");

        var invalidOffer = await client.SendAsync(Json(
            HttpMethod.Post, "/api/offers", AddOfferBody(new string('d', 2001)), session.AccessToken), TestContext.Current.CancellationToken);
        var invalidRegister = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "", email = NewEmail("invalid"), password = "short" }), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, invalidOffer.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidRegister.StatusCode);
        Assert.Equal(offersBefore, await CountAsync("offers"));
        Assert.Equal(usersBefore, await CountAsync("users"));
    }

    [Fact]
    public async Task OversizedRequest_IsRejected()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("oversized"));
        var before = await CountAsync("offers");
        var body = JsonBody(new
        {
            description = new string('x', 9 * 1024 * 1024),
            tags = Array.Empty<string>(),
            images = Array.Empty<object>(),
            location = (object?)null
        });

        var response = await client.SendAsync(Raw(HttpMethod.Post, "/api/offers", body, session.AccessToken), TestContext.Current.CancellationToken);

        // Kestrel returns 413 for the real server; TestServer has no Kestrel body
        // limit and falls through to validation, which rejects the 2000-char cap.
        Assert.True(response.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.RequestEntityTooLarge);
        Assert.Equal(before, await CountAsync("offers"));
    }
}
