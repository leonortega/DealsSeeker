using System.Net;
using System.Net.Http.Json;
using Dapper;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// OWASP Top 10 A09:2021 — Security Logging and Monitoring Failures.
/// Asserts that security-relevant events reach the log sink without sensitive
/// data, and that RED/custom metrics and health probes are exposed.
/// </summary>
public class OwaspLoggingAndMonitoringTests(LoggingApiFactory factory) : IClassFixture<LoggingApiFactory>
{
    [Fact]
    public async Task RegistrationEvent_IsLoggedWithoutCredentials()
    {
        using var client = factory.CreateClient();
        var email = $"a09-{Guid.NewGuid():N}@example.com";
        const string password = "password1";

        var register = await client.PostAsJsonAsync("/api/auth/register", new { displayName = "Monitoring", email, password }, cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, register.StatusCode);

        var entries = await ReadLogsAsync(entry => entry.RenderedMessage.Contains(email, StringComparison.Ordinal));

        Assert.Contains(entries, entry => entry.RenderedMessage.Contains(email, StringComparison.Ordinal));
        Assert.Contains(entries, entry => entry.SourceContext == "DealsSeeker.Auth");
        Assert.DoesNotContain(entries, entry => entry.RenderedMessage.Contains(password, StringComparison.Ordinal));
    }

    [Fact]
    public async Task MetricsEndpoint_ExposesRedAndCustomInstruments()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/metrics", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("http_server_request_duration_seconds", body, StringComparison.Ordinal);
        Assert.Contains("aspnetcore_rate_limiting_requests_total", body, StringComparison.Ordinal);
        Assert.Contains("dealseeker", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task HealthEndpoints_ExposeLivenessAndReadiness()
    {
        using var client = factory.CreateClient();

        var live = await client.GetAsync("/health/live", TestContext.Current.CancellationToken);
        var ready = await client.GetAsync("/health/ready", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, live.StatusCode);
        Assert.Equal(HttpStatusCode.OK, ready.StatusCode);
        Assert.Contains("Healthy", await ready.Content.ReadAsStringAsync(TestContext.Current.CancellationToken), StringComparison.Ordinal);
    }

    private async Task<List<LogEntry>> ReadLogsAsync(Func<LogEntry, bool> predicate)
    {
        var rows = new List<LogEntry>();
        for (var attempt = 0; attempt < 25; attempt += 1)
        {
            if (File.Exists(factory.LogDatabasePath))
            {
                await using var connection = new SqliteConnection($"Data Source={factory.LogDatabasePath}");
                await connection.OpenAsync();
                rows = (await connection.QueryAsync<LogEntry>(
                        "SELECT rendered_message AS RenderedMessage, source_context AS SourceContext FROM logs"))
                    .ToList();
                if (rows.Any(predicate))
                {
                    return rows;
                }
            }

            // The sink batches writes; the event may not be visible yet.
            await Task.Delay(200);
        }

        return rows;
    }

    private sealed record LogEntry(string RenderedMessage, string? SourceContext);
}
