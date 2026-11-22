using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using DealsSeeker.IntegrationTests;
using Xunit;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// Authentication and authorization edge cases: token parsing, session lifecycle,
/// cross-user access and credential policy.
/// </summary>
public class AuthenticationSecurityTests(ApiFactory factory) : SecurityTestBase(factory)
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("Bearer")]
    [InlineData("Bearer ")]
    [InlineData("Basic abc")]
    [InlineData("Token abc")]
    [InlineData("Bearer not-a-valid-token")]
    public async Task ProtectedEndpoint_RejectsMalformedOrInvalidAuthorizationHeader(string? header)
    {
        using var client = CreateClient();
        await RegisterAndLoginAsync(client, NewEmail("auth-shape"));

        using var request = Get("/api/account/me");
        if (header is not null)
        {
            request.Headers.TryAddWithoutValidation("Authorization", header);
        }

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ValidToken_IsAcceptedWithLowercaseSchemeAndExtraWhitespace()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("auth-case"));

        foreach (var header in new[] { $"bearer {session.AccessToken}", $"Bearer   {session.AccessToken}" })
        {
            using var request = Get("/api/account/me");
            request.Headers.TryAddWithoutValidation("Authorization", header);

            var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task TokenInQueryString_IsNotAccepted()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("auth-query"));

        var response = await client.GetAsync($"/api/account/me?access_token={Uri.EscapeDataString(session.AccessToken)}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_RevokesTokenAcrossAllProtectedEndpoints()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, NewEmail("auth-logout"));

        var logout = await client.SendAsync(Json(HttpMethod.Post, "/api/auth/logout", new { }, session.AccessToken), TestContext.Current.CancellationToken);
        var profile = await client.SendAsync(Get("/api/account/me", session.AccessToken), TestContext.Current.CancellationToken);
        var offers = await client.SendAsync(Get("/api/account/offers", session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, profile.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, offers.StatusCode);
    }

    [Fact]
    public async Task CrossUserOfferAccess_IsDenied()
    {
        using var client = CreateClient();
        var owner = await RegisterAndLoginAsync(client, NewEmail("auth-owner"), "Owner");
        var other = await RegisterAndLoginAsync(client, NewEmail("auth-other"), "Other");

        var create = await client.SendAsync(Json(HttpMethod.Post, "/api/offers", AddOfferBody("Owner offer"), owner.AccessToken), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var offerId = OfferIdFrom(await create.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.False(string.IsNullOrWhiteSpace(offerId));

        var draft = await client.SendAsync(Get($"/api/account/offers/{offerId}", other.AccessToken), TestContext.Current.CancellationToken);
        var update = await client.SendAsync(Json(HttpMethod.Put, $"/api/offers/{offerId}", AddOfferBody("Hijacked"), other.AccessToken), TestContext.Current.CancellationToken);

        using var delete = new HttpRequestMessage(HttpMethod.Delete, $"/api/offers/{offerId}");
        delete.Headers.Authorization = new AuthenticationHeaderValue("Bearer", other.AccessToken);
        var removal = await client.SendAsync(delete, TestContext.Current.CancellationToken);

        var othersList = await client.SendAsync(Get("/api/account/offers", other.AccessToken), TestContext.Current.CancellationToken);
        var ownersDraft = await client.SendAsync(Get($"/api/account/offers/{offerId}", owner.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, draft.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, update.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, removal.StatusCode);
        Assert.False((await othersList.Content.ReadAsStringAsync(TestContext.Current.CancellationToken)).Contains(offerId!, StringComparison.Ordinal));
        Assert.Equal(HttpStatusCode.OK, ownersDraft.StatusCode);

        var description = await ScalarAsync<string>(
            "SELECT description FROM offers WHERE offer_id = @OfferId",
            new { OfferId = offerId });
        Assert.Equal("Owner offer", description);
    }

    [Theory]
    [InlineData(7, HttpStatusCode.BadRequest)]
    [InlineData(8, HttpStatusCode.OK)]
    [InlineData(200, HttpStatusCode.OK)]
    [InlineData(201, HttpStatusCode.BadRequest)]
    public async Task PasswordLength_EnforcesDeclaredBoundaries(int length, HttpStatusCode expected)
    {
        using var client = CreateClient();
        var password = new string('a', length - 1) + "1";

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "Boundary", email = NewEmail("pw-length"), password }), TestContext.Current.CancellationToken);

        Assert.Equal(expected, response.StatusCode);
    }

    [Theory]
    [InlineData("abcdefgh")]
    [InlineData("12345678")]
    [InlineData("no-digit-here")]
    public async Task Password_RequiresLetterAndDigit(string password)
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "Policy", email = NewEmail("pw-policy"), password }), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task EmailNormalization_AllowsCaseInsensitiveLoginAndBlocksDuplicateRegistration()
    {
        using var client = CreateClient();
        var email = NewEmail("auth-email");
        var mixedCase = email.Replace("auth-email", "Auth-Email", StringComparison.Ordinal);

        var register = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "Email", email = mixedCase, password = "password1" }), TestContext.Current.CancellationToken);
        var login = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new { email = mixedCase.ToUpperInvariant(), password = "password1" }), TestContext.Current.CancellationToken);
        var duplicate = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "Email", email, password = "password1" }), TestContext.Current.CancellationToken);
        var wrongCaseLogin = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new { email = "MISSING" + email, password = "password1" }), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, register.StatusCode);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, wrongCaseLogin.StatusCode);
    }

    [Fact]
    public async Task InvalidCredentials_DoNotDistinguishUnknownUserFromWrongPassword()
    {
        using var client = CreateClient();
        var email = NewEmail("auth-enum");
        await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "Enum", email, password = "password1" }), TestContext.Current.CancellationToken);

        var unknown = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new { email = NewEmail("auth-missing"), password = "password1" }), TestContext.Current.CancellationToken);
        var wrongPassword = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new { email, password = "wrongpass1" }), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, unknown.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal(await unknown.Content.ReadAsStringAsync(TestContext.Current.CancellationToken), await wrongPassword.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }
}
