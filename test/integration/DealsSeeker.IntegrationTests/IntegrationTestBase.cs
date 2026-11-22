using System.Net.Http.Json;
using DealsSeeker.Shared.Contracts.Account;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public abstract class IntegrationTestBase(ApiFactory factory) : IClassFixture<ApiFactory>
{
    protected ApiFactory Factory { get; } = factory;

    protected HttpClient CreateClient() => Factory.CreateClient();

    protected static HttpRequestMessage Json<T>(HttpMethod method, string path, T body, string? token = null)
    {
        var request = new HttpRequestMessage(method, path)
        {
            Content = JsonContent.Create(body)
        };
        if (token is not null)
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }

        return request;
    }

    protected static HttpRequestMessage Get(string path, string? token = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        if (token is not null)
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }

        return request;
    }

    protected async Task<AuthSessionDto> RegisterAndLoginAsync(
        HttpClient client,
        string? email = null,
        string displayName = "Ada",
        string password = "password1")
    {
        email ??= $"user-{Guid.NewGuid():N}@example.com";

        var register = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/register",
            new RegisterUserRequest(displayName, email, password)));
        Assert.True(register.IsSuccessStatusCode, await register.Content.ReadAsStringAsync());

        var login = await client.SendAsync(Json(
            HttpMethod.Post,
            "/api/auth/login",
            new LoginRequest(email, password)));
        Assert.True(login.IsSuccessStatusCode, await login.Content.ReadAsStringAsync());

        return (await login.Content.ReadFromJsonAsync<AuthSessionDto>())!;
    }
}
