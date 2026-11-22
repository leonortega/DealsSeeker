using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Dapper;
using DealsSeeker.Api.Persistence;
using DealsSeeker.IntegrationTests;
using Microsoft.Extensions.DependencyInjection;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// Shared helpers for adversarial requests and direct database assertions.
/// </summary>
public abstract class SecurityTestBase(ApiFactory factory) : IntegrationTestBase(factory)
{
    protected static HttpRequestMessage Raw(
        HttpMethod method,
        string path,
        string? body,
        string? token = null,
        string contentType = "application/json")
    {
        var request = new HttpRequestMessage(method, path);
        if (body is not null)
        {
            request.Content = new StringContent(body, Encoding.UTF8, contentType);
        }

        if (token is not null)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        return request;
    }

    protected static HttpRequestMessage WithHeader(HttpMethod method, string path, string name, string value)
    {
        var request = new HttpRequestMessage(method, path);
        request.Headers.TryAddWithoutValidation(name, value);
        return request;
    }

    protected static string JsonBody(object value) => JsonSerializer.Serialize(value);

    protected static string NewEmail(string prefix) => $"{prefix}-{Guid.NewGuid():N}@example.com";

    protected static object AddOfferBody(string description, string[]? tags = null) => new
    {
        description,
        tags = tags ?? ["coffee"],
        images = Array.Empty<object>(),
        location = new
        {
            source = "manual",
            label = "Security test",
            position = new { lat = 40.7131, lng = -74.0055 }
        }
    };

    protected static string? OfferIdFrom(string json) =>
        JsonDocument.Parse(json).RootElement.GetProperty("offerId").GetString();

    protected async Task<T> ScalarAsync<T>(string sql, object? parameters = null) =>
        await ScalarForAsync<T>(Factory, sql, parameters);

    protected Task<int> CountAsync(string table) => ScalarAsync<int>($"SELECT COUNT(*) FROM {table}");

    protected static async Task<T> ScalarForAsync<T>(ApiFactory factory, string sql, object? parameters = null)
    {
        using var scope = factory.Services.CreateScope();
        var connectionFactory = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();
        await using var lease = await connectionFactory.RentAsync(CancellationToken.None);
        return (await lease.Connection.QueryFirstOrDefaultAsync<T>(sql, parameters))!;
    }

    protected static Task<int> CountForAsync(ApiFactory factory, string table) =>
        ScalarForAsync<int>(factory, $"SELECT COUNT(*) FROM {table}");
}
