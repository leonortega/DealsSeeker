using Dapper;
using DealsSeeker.Api.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DealsSeeker.IntegrationTests;

public class PersistenceIntegrationTests(ApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Startup_AppliedEveryMigrationExactlyOnce()
    {
        using var scope = Factory.Services.CreateScope();
        var connectionFactory = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();
        await using var lease = await connectionFactory.RentAsync(CancellationToken.None);
        var connection = lease.Connection;

        var count = await connection.ExecuteScalarAsync<long>("SELECT COUNT(1) FROM schema_migrations;");
        var duplicates = await connection.ExecuteScalarAsync<long>(
            "SELECT COUNT(1) FROM (SELECT id FROM schema_migrations GROUP BY id HAVING COUNT(1) > 1);");
        var tables = await connection.ExecuteScalarAsync<long>(
            "SELECT COUNT(1) FROM sqlite_master WHERE type = 'table' AND name IN ('users','offers','offer_comments','suggestions','reports');");

        Assert.True(count >= 8);
        Assert.Equal(0, duplicates);
        Assert.Equal(5, tables);
    }

    [Fact]
    public async Task ApplyMigrationsAgain_IsIdempotent()
    {
        using var scope = Factory.Services.CreateScope();
        var runner = scope.ServiceProvider.GetRequiredService<IDatabaseMigrationRunner>();

        await runner.ApplyMigrationsAsync(CancellationToken.None);
        await runner.ApplyMigrationsAsync(CancellationToken.None);

        using var verifyScope = Factory.Services.CreateScope();
        var verifyFactory = verifyScope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();
        await using var verifyLease = await verifyFactory.RentAsync(CancellationToken.None);
        var count = await verifyLease.Connection.ExecuteScalarAsync<long>("SELECT COUNT(1) FROM schema_migrations;");
        Assert.True(count >= 8);
    }

    [Fact]
    public void ResolveDataSource_HandlesMemoryAndRootedPaths()
    {
        Assert.Equal(":memory:", SqlitePathResolver.ResolveDataSource(":memory:", "root"));
        Assert.Equal("", SqlitePathResolver.ResolveDataSource(null, "root"));

        var rooted = Path.Combine(Path.GetTempPath(), "dealseeker.db");
        Assert.Equal(rooted, SqlitePathResolver.ResolveDataSource(rooted, "root"));
    }

    [Fact]
    public void ResolveDataSource_LocatesApiProjectRoot()
    {
        var root = Path.Combine(Path.GetTempPath(), $"dealseeker-path-{Guid.NewGuid():N}");
        var apiDirectory = Path.Combine(root, "src", "DealsSeeker.Api");
        Directory.CreateDirectory(apiDirectory);
        File.WriteAllText(Path.Combine(apiDirectory, "DealsSeeker.Api.csproj"), "<Project />");

        try
        {
            var resolved = SqlitePathResolver.ResolveDataSource("Data/dealseeker.db", root);
            Assert.Equal(Path.GetFullPath(Path.Combine(apiDirectory, "Data/dealseeker.db")), resolved);
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    [Fact]
    public void NormalizeConnectionString_CreatesDirectoryForRelativeDataSource()
    {
        var root = Path.Combine(Path.GetTempPath(), $"dealseeker-path-{Guid.NewGuid():N}");
        var apiDirectory = Path.Combine(root, "src", "DealsSeeker.Api");
        Directory.CreateDirectory(apiDirectory);
        File.WriteAllText(Path.Combine(apiDirectory, "DealsSeeker.Api.csproj"), "<Project />");

        try
        {
            var normalized = SqlitePathResolver.NormalizeConnectionString("Data Source=Data/nested/deals.db", root);

            Assert.Contains("deals.db", normalized);
            Assert.True(Directory.Exists(Path.Combine(apiDirectory, "Data", "nested")));
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }
}
