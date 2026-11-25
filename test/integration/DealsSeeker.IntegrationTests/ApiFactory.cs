using DealsSeeker.Api.Services.Locations;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DealsSeeker.IntegrationTests;

/// <summary>
/// Boots the real API pipeline against an isolated SQLite file database.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseDirectory;

    public string DatabasePath { get; }

    public ApiFactory()
    {
        _databaseDirectory = Path.Combine(Path.GetTempPath(), $"dealseeker-it-{Guid.NewGuid():N}");
        Directory.CreateDirectory(_databaseDirectory);
        DatabasePath = Path.Combine(_databaseDirectory, "integration.db");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:ConnectionString"] = $"Data Source={DatabasePath}",
                ["LoggingPersistence:EnableDatabaseSink"] = "false",
                ["Photon:BaseUrl"] = "https://photon.komoot.io/api"
            });
        });
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
            Directory.Delete(_databaseDirectory, recursive: true);
        }
        catch (IOException)
        {
            // The database may still be held briefly by SQLite; the temp directory is disposable.
        }
    }
}

/// <summary>Replaces the external map providers with a deterministic stub.</summary>
public sealed class LocationApiFactory : ApiFactory
{
    public StubLocationLookup Lookup { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<ILocationLookupService>();
            services.AddSingleton<ILocationLookupService>(Lookup);
        });
    }
}

public sealed class StubLocationLookup : ILocationLookupService
{
    public IReadOnlyList<LocationSearchResultDto> SearchResults { get; set; } = [];
    public LocationSearchResultDto? ReverseResult { get; set; }
    public bool ThrowOnSearch { get; set; }
    public int SearchCalls { get; private set; }
    public int ReverseCalls { get; private set; }

    public void Reset()
    {
        SearchResults = [];
        ReverseResult = null;
        ThrowOnSearch = false;
        SearchCalls = 0;
        ReverseCalls = 0;
    }

    public Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        SearchCalls++;
        if (ThrowOnSearch)
        {
            throw new LocationProviderUnavailableException("all providers failed");
        }

        return Task.FromResult(SearchResults);
    }

    public Task<LocationSearchResultDto?> ReverseAsync(GeoPoint point, CancellationToken cancellationToken)
    {
        ReverseCalls++;
        return Task.FromResult(ReverseResult);
    }
}
