using Dapper;
using System.Text.RegularExpressions;

namespace DealsSeeker.Api.Persistence;

/// <summary>
/// Applies pending SQL migrations in filename order, exactly once.
/// </summary>
/// <remarks>
/// Each migration is applied inside an <c>IMMEDIATE</c> transaction so that the database write lock is
/// taken before the "already applied?" check. Without this, two instances starting concurrently could
/// both observe a migration as pending and apply it twice.
/// </remarks>
public sealed class SqliteMigrationRunner(
    IDbConnectionFactory connectionFactory,
    IHostEnvironment environment,
    ILogger<SqliteMigrationRunner> logger) : IDatabaseMigrationRunner
{
    private static readonly Regex ExplicitTransactionRegex = new(
        @"\b(BEGIN(\s+TRANSACTION)?|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)\b",
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled);

    public async Task ApplyMigrationsAsync(CancellationToken cancellationToken)
    {
        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;

        await connection.ExecuteAsync(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id TEXT PRIMARY KEY,
                applied_at_utc TEXT NOT NULL
            );
            """);

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

            if (await IsAppliedAsync(connection, migrationId).ConfigureAwait(false))
            {
                continue;
            }

            var sql = await File.ReadAllTextAsync(migrationFile, cancellationToken);
            if (UsesExplicitTransactionControl(sql))
            {
                // The migration manages its own transaction, so it cannot be wrapped in one.
                await connection.ExecuteAsync(sql);
                await RecordAppliedAsync(connection, migrationId, null);
                logger.LogInformation("Applied database migration {MigrationId}", migrationId);
                continue;
            }

            await using var transaction = connection.BeginTransaction(deferred: false);
            try
            {
                // Re-check under the write lock: another instance may have applied it in the meantime.
                if (await IsAppliedAsync(connection, migrationId, transaction).ConfigureAwait(false))
                {
                    await transaction.RollbackAsync(cancellationToken);
                    continue;
                }

                await connection.ExecuteAsync(sql, transaction: transaction);
                await RecordAppliedAsync(connection, migrationId, transaction);
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

    private static async Task<bool> IsAppliedAsync(
        Microsoft.Data.Sqlite.SqliteConnection connection,
        string migrationId,
        Microsoft.Data.Sqlite.SqliteTransaction? transaction = null)
    {
        var applied = await connection.ExecuteScalarAsync<long>(
            "SELECT COUNT(1) FROM schema_migrations WHERE id = @Id;",
            new { Id = migrationId },
            transaction).ConfigureAwait(false);

        return applied > 0;
    }

    private static Task RecordAppliedAsync(
        Microsoft.Data.Sqlite.SqliteConnection connection,
        string migrationId,
        Microsoft.Data.Sqlite.SqliteTransaction? transaction)
    {
        return connection.ExecuteAsync(
            "INSERT INTO schema_migrations (id, applied_at_utc) VALUES (@Id, @AppliedAtUtc);",
            new { Id = migrationId, AppliedAtUtc = Timestamp.NowUtc() },
            transaction);
    }

    private static bool UsesExplicitTransactionControl(string sql)
    {
        return ExplicitTransactionRegex.IsMatch(sql);
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
