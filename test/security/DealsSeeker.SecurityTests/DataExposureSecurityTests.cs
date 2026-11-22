using System.Net;
using System.Text.Json;
using DealsSeeker.IntegrationTests;
using Xunit;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// Checks that credentials and implementation details never reach API responses,
/// while the stored representation remains a salted, stretched hash.
/// </summary>
public class DataExposureSecurityTests(ApiFactory factory) : SecurityTestBase(factory)
{
    [Fact]
    public async Task AuthAndProfileResponses_NeverExposePasswordsOrHashes()
    {
        using var client = CreateClient();
        var email = NewEmail("exposure");

        var register = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "Exposure", email, password = "password1" }), TestContext.Current.CancellationToken);
        var login = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new { email, password = "password1" }), TestContext.Current.CancellationToken);
        var session = JsonDocument.Parse(await login.Content.ReadAsStringAsync(TestContext.Current.CancellationToken))
            .RootElement.GetProperty("accessToken").GetString();
        var profile = await client.SendAsync(Get("/api/account/me", session!), TestContext.Current.CancellationToken);

        foreach (var body in new[]
                 {
                     await register.Content.ReadAsStringAsync(TestContext.Current.CancellationToken),
                     await login.Content.ReadAsStringAsync(TestContext.Current.CancellationToken),
                     await profile.Content.ReadAsStringAsync(TestContext.Current.CancellationToken)
        })
        {
            Assert.DoesNotContain("password", body, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("pbkdf2", body, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain("passwordHash", body, StringComparison.OrdinalIgnoreCase);
        }
    }

    [Fact]
    public async Task StoredCredentials_AreSaltedPbkdf2Hashes()
    {
        using var client = CreateClient();
        const string password = "password1";
        var firstEmail = NewEmail("hash-a");
        var secondEmail = NewEmail("hash-b");

        foreach (var email in new[] { firstEmail, secondEmail })
        {
            var response = await client.SendAsync(Json(
                HttpMethod.Post,
                "/api/auth/register",
                new { displayName = "Hash", email, password }), TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        var first = await HashForAsync(firstEmail);
        var second = await HashForAsync(secondEmail);

        AssertPbkdf2Format(first);
        AssertPbkdf2Format(second);
        Assert.NotEqual("password1", first);
        Assert.NotEqual(first, second);
    }

    [Fact]
    public async Task ValidationErrors_UseStandardShapeWithoutImplementationDetails()
    {
        using var client = CreateClient();

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "", email = "not-an-email", password = "short" }), TestContext.Current.CancellationToken);

        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("\"type\"", body, StringComparison.Ordinal);
        Assert.Contains("\"title\"", body, StringComparison.Ordinal);
        Assert.Contains("\"status\"", body, StringComparison.Ordinal);
        Assert.Contains("\"detail\"", body, StringComparison.Ordinal);
        Assert.Contains("\"errors\"", body, StringComparison.Ordinal);
        Assert.DoesNotContain("System.", body, StringComparison.Ordinal);
        Assert.DoesNotContain("SqliteException", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Stack", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task FailedLogin_DoesNotReturnTheStoredHash()
    {
        using var client = CreateClient();
        var email = NewEmail("failed-login");
        await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new { displayName = "Login", email, password = "password1" }), TestContext.Current.CancellationToken);

        var response = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new { email, password = "wrongpass1" }), TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.DoesNotContain("pbkdf2", body, StringComparison.OrdinalIgnoreCase);
    }

    private async Task<string> HashForAsync(string email) =>
        await ScalarAsync<string>("SELECT password_hash FROM users WHERE email = @Email", new { Email = email });

    private static void AssertPbkdf2Format(string stored)
    {
        var parts = stored.Split('$', StringSplitOptions.RemoveEmptyEntries);
        Assert.Equal(4, parts.Length);
        Assert.Equal("pbkdf2-sha256", parts[0]);
        Assert.StartsWith("i=", parts[1], StringComparison.Ordinal);
        Assert.True(int.Parse(parts[1][2..]) >= 100_000);
        Assert.NotEmpty(Convert.FromBase64String(parts[2]));
        Assert.NotEmpty(Convert.FromBase64String(parts[3]));
    }
}
