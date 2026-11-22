using DealsSeeker.IntegrationTests;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace DealsSeeker.SecurityTests;

/// <summary>
/// Enables the asynchronous database log sink so tests can assert what was
/// recorded for security-relevant events.
/// </summary>
public sealed class LoggingApiFactory : ApiFactory
{
    private readonly string _logDirectory;

    public string LogDatabasePath { get; }

    public LoggingApiFactory()
    {
        _logDirectory = Path.Combine(Path.GetTempPath(), $"dealseeker-sec-logs-{Guid.NewGuid():N}");
        Directory.CreateDirectory(_logDirectory);
        LogDatabasePath = Path.Combine(_logDirectory, "logs.db");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                ["LoggingPersistence:EnableDatabaseSink"] = "true",
                ["LoggingPersistence:ConnectionString"] = $"Data Source={LogDatabasePath}"
            }));
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing)
        {
            return;
        }

        try
        {
            Directory.Delete(_logDirectory, recursive: true);
        }
        catch (IOException)
        {
            // The sink may hold the file briefly; the directory is temporary.
        }
    }
}
