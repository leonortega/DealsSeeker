using Dapper;

namespace DealsSeeker.Api.Persistence;

public sealed class SqliteMigrationRunner(
    IDbConnectionFactory connectionFactory,
    IHostEnvironment environment,
    ILogger<SqliteMigrationRunner> logger) : IDatabaseMigrationRunner
{
    public async Task ApplyMigrationsAsync(CancellationToken cancellationToken)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await connection.ExecuteAsync("""
                                     CREATE TABLE IF NOT EXISTS schema_migrations (
                                         id TEXT PRIMARY KEY,
                                         applied_at_utc TEXT NOT NULL
                                     );
                                     """);

        var appliedMigrations = (await connection.QueryAsync<string>("SELECT id FROM schema_migrations;"))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var migrationDirectory = ResolveMigrationDirectory();
        if (migrationDirectory is null)
        {
            logger.LogWarning(
                "Migration directory not found. Checked: {ContentRootPath}, {AppBasePath}, {RepoPath}",
                Path.Combine(environment.ContentRootPath, "Persistence", "Migrations"),
                Path.Combine(AppContext.BaseDirectory, "Persistence", "Migrations"),
                Path.Combine(environment.ContentRootPath, "src", "DealsSeeker.Api", "Persistence", "Migrations"));
            return;
        }

        var migrationFiles = Directory.GetFiles(migrationDirectory, "*.sql")
            .OrderBy(Path.GetFileName, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        foreach (var migrationFile in migrationFiles)
        {
            var migrationId = Path.GetFileName(migrationFile);
            if (appliedMigrations.Contains(migrationId))
            {
                continue;
            }

            var sql = await File.ReadAllTextAsync(migrationFile, cancellationToken);
            await using var transaction = connection.BeginTransaction();
            try
            {
                await connection.ExecuteAsync(sql, transaction: transaction);
                await connection.ExecuteAsync(
                    "INSERT INTO schema_migrations (id, applied_at_utc) VALUES (@Id, @AppliedAtUtc);",
                    new { Id = migrationId, AppliedAtUtc = DateTimeOffset.UtcNow.ToString("O") },
                    transaction);
                await transaction.CommitAsync(cancellationToken);
                logger.LogInformation("Applied database migration {MigrationId}", migrationId);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }

    private string? ResolveMigrationDirectory()
    {
        var candidates = new[]
        {
            Path.Combine(environment.ContentRootPath, "Persistence", "Migrations"),
            Path.Combine(AppContext.BaseDirectory, "Persistence", "Migrations"),
            Path.Combine(environment.ContentRootPath, "src", "DealsSeeker.Api", "Persistence", "Migrations")
        };

        return candidates.FirstOrDefault(Directory.Exists);
    }
}
