using System.Net;
using System.Net.Http.Json;
using Dapper;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Shared.Avatars;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public class AuthenticationIntegrationTests(ApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Register_ThenLogin_ReturnsSessionAndProfile()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client);

        var profileResponse = await client.SendAsync(Get("/api/account/me", session.AccessToken), TestContext.Current.CancellationToken);
        var profile = await profileResponse.Content.ReadFromJsonAsync<UserProfileDto>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, profileResponse.StatusCode);
        Assert.Equal(session.UserId, profile!.UserId);
        Assert.Equal(AvatarCatalog.DefaultAvatarId, profile.AvatarId);
    }

    [Fact]
    public async Task Register_DuplicateEmail_ReturnsBadRequest()
    {
        using var client = CreateClient();
        var request = new RegisterUserRequest("Ada", "duplicate@example.com", "password1");
        await client.SendAsync(Json(HttpMethod.Post, "/api/auth/register", request), TestContext.Current.CancellationToken);

        var response = await client.SendAsync(Json(HttpMethod.Post, "/api/auth/register", request), TestContext.Current.CancellationToken);
        var result = await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("already exists", result!.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Register_InvalidPayload_ReturnsValidationProblem()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new RegisterUserRequest("", " ", "short")), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.True(body.Contains("displayName", StringComparison.OrdinalIgnoreCase), body);
        Assert.True(body.Contains("email", StringComparison.OrdinalIgnoreCase), body);
        Assert.True(body.Contains("password", StringComparison.OrdinalIgnoreCase), body);
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsUnauthorized()
    {
        using var client = CreateClient();
        await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new RegisterUserRequest("Ada", "login@example.com", "password1")), TestContext.Current.CancellationToken);

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new LoginRequest("login@example.com", "wrong-password")), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("not-a-token")]
    public async Task ProtectedEndpoint_RejectsMissingOrInvalidToken(string? token)
    {
        using var client = CreateClient();
        await RegisterAndLoginAsync(client);

        var response = await client.SendAsync(Get("/api/account/me", token), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_RevokesSessionImmediately()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "logout@example.com");

        var logout = await client.SendAsync(Json(HttpMethod.Post, "/api/auth/logout", new { }, session.AccessToken), TestContext.Current.CancellationToken);
        var afterLogout = await client.SendAsync(Get("/api/account/me", session.AccessToken), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, afterLogout.StatusCode);
    }

    [Fact]
    public async Task Profile_SupportsConditionalRequests()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "etag@example.com");
        var first = await client.SendAsync(Get("/api/account/me", session.AccessToken), TestContext.Current.CancellationToken);
        var etag = first.Headers.TryGetValues("ETag", out var values) ? values.FirstOrDefault() : null;
        Assert.False(string.IsNullOrWhiteSpace(etag));

        using var conditional = new HttpRequestMessage(HttpMethod.Get, "/api/account/me");
        conditional.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", session.AccessToken);
        conditional.Headers.TryAddWithoutValidation("If-None-Match", etag);
        var second = await client.SendAsync(conditional, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotModified, second.StatusCode);
    }

    [Fact]
    public async Task UpdateAvatar_PersistsSelection()
    {
        using var client = CreateClient();
        var session = await RegisterAndLoginAsync(client, "avatar@example.com");

        var update = await client.SendAsync(Json(
            HttpMethod.Put,
            "/api/account/me/avatar",
            new SetAvatarRequest("cat"),
            session.AccessToken), TestContext.Current.CancellationToken);

        using var scope = Factory.Services.CreateScope();
        var connectionFactory = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();
        await using var lease = await connectionFactory.RentAsync(CancellationToken.None);
        var storedAvatar = await lease.Connection.ExecuteScalarAsync<string>(
            "SELECT avatar_id FROM users WHERE user_id = @UserId;",
            new { session.UserId });

        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal("cat", storedAvatar);
    }
}
