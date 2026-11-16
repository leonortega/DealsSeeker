using Dapper;
using DealsSeeker.Api.Options;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

namespace DealsSeeker.Api.Persistence;

/// <summary>
/// Creates pooled SQLite connections configured for concurrent read/write access.
/// </summary>
/// <remarks>
/// The connection-level pragmas (<c>foreign_keys</c>, <c>busy_timeout</c>, <c>synchronous</c>,
/// <c>cache_size</c>, <c>mmap_size</c>) are applied once per physical connection, when the pool
/// opens it, instead of once per request.
/// </remarks>
public sealed class SqliteConnectionFactory : IDbConnectionFactory, IDisposable
{
    private static readonly string[] AllowedJournalModes = ["DELETE", "TRUNCATE", "PERSIST", "MEMORY", "WAL", "OFF"];

    private readonly SqliteConnectionPool _pool;
    private readonly DatabaseOptions _options;
    private readonly ILogger<SqliteConnectionFactory> _logger;

    public SqliteConnectionFactory(
        IOptions<DatabaseOptions> options,
        IHostEnvironment environment,
        ILogger<SqliteConnectionFactory> logger)
    {
        _options = options.Value;
        _logger = logger;

        var connectionString = SqlitePathResolver.NormalizeConnectionString(_options.ConnectionString, environment.ContentRootPath);
        _pool = new SqliteConnectionPool(connectionString, _options);
    }

    public Task<SqliteConnectionLease> RentAsync(CancellationToken cancellationToken) =>
        _pool.RentAsync(cancellationToken);

    /// <summary>
    /// Switches the database file to the configured journal mode. This is a persistent, file-level
    /// setting and therefore only needs to be applied once, not per connection.
    /// </summary>
    public async Task ApplyJournalModeAsync(CancellationToken cancellationToken)
    {
        var requested = NormalizeJournalMode(_options.JournalMode);
        await using var lease = await RentAsync(cancellationToken).ConfigureAwait(false);
        var applied = await lease.Connection.ExecuteScalarAsync<string>($"PRAGMA journal_mode = {requested};")
            .ConfigureAwait(false);

        if (!string.IsNullOrWhiteSpace(applied) &&
            !applied.Equals(requested, StringComparison.OrdinalIgnoreCase))
        {
            // A different mode is reported when the database is locked or the file system does not
            // support shared memory. Falling back keeps the API serving traffic with reduced concurrency.
            _logger.LogWarning(
                "SQLite journal mode could not be set to {Requested}; database reports {Actual}.",
                requested,
                applied);
        }
    }

    private static string NormalizeJournalMode(string? value)
    {
        var candidate = (value ?? string.Empty).Trim().ToUpperInvariant();
        return AllowedJournalModes.Contains(candidate, StringComparer.Ordinal) ? candidate : "WAL";
    }

    public void Dispose() => _pool.Dispose();
}
