using System.Collections.Concurrent;
using System.Data;
using Dapper;
using DealsSeeker.Api.Options;
using Microsoft.Data.Sqlite;

namespace DealsSeeker.Api.Persistence;

/// <summary>
/// A small connection pool for SQLite.
/// </summary>
/// <remarks>
/// Microsoft.Data.Sqlite does not ship a built-in pool, and opening a SQLite connection per
/// operation repeats the file open and the connection-level pragma round trip on every call.
/// Connections are reused here, and the pragmas are applied once per physical connection.
/// </remarks>
public sealed class SqliteConnectionPool : IDisposable
{
    private readonly ConcurrentBag<SqliteConnection> _idle = new();
    private readonly string _connectionString;
    private readonly DatabaseOptions _options;
    private readonly int _maxPoolSize;
    private int _createdCount;

    public SqliteConnectionPool(string connectionString, DatabaseOptions options, int maxPoolSize = 64)
    {
        _connectionString = connectionString;
        _options = options;
        _maxPoolSize = Math.Max(1, maxPoolSize);
    }

    public int IdleCount => _idle.Count;

    public int CreatedCount => Volatile.Read(ref _createdCount);

    public async Task<SqliteConnectionLease> RentAsync(CancellationToken cancellationToken)
    {
        var connection = TakeIdle();
        if (connection is null)
        {
            connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
            await ApplyConnectionPragmasAsync(connection, _options).ConfigureAwait(false);
            Interlocked.Increment(ref _createdCount);
        }

        return new SqliteConnectionLease(this, connection);
    }

    internal void Return(SqliteConnection connection)
    {
        try
        {
            if (connection.State != ConnectionState.Open)
            {
                connection.Dispose();
                Interlocked.Decrement(ref _createdCount);
                return;
            }

            if (_idle.Count >= _maxPoolSize)
            {
                connection.Dispose();
                Interlocked.Decrement(ref _createdCount);
                return;
            }

            _idle.Add(connection);
        }
        catch
        {
            connection.Dispose();
            Interlocked.Decrement(ref _createdCount);
        }
    }

    private SqliteConnection? TakeIdle()
    {
        while (_idle.TryTake(out var connection))
        {
            if (connection.State == ConnectionState.Open)
            {
                return connection;
            }

            connection.Dispose();
            Interlocked.Decrement(ref _createdCount);
        }

        return null;
    }

    private static async Task ApplyConnectionPragmasAsync(SqliteConnection connection, DatabaseOptions options)
    {
        // foreign_keys and busy_timeout are per-connection correctness/concurrency settings;
        // synchronous, cache_size and mmap_size are per-connection performance settings.
        // They are applied in one round trip instead of one round trip per pragma.
        var sql = $"""
                   PRAGMA foreign_keys = ON;
                   PRAGMA busy_timeout = {Math.Clamp(options.BusyTimeoutMs, 0, 60_000)};
                   PRAGMA synchronous = {NormalizeSynchronous(options.Synchronous)};
                   PRAGMA cache_size = {options.CacheSizeKb};
                   PRAGMA temp_store = MEMORY;
                   PRAGMA mmap_size = {Math.Max(0, options.MmapSizeBytes)};
                   """;

        await connection.ExecuteAsync(sql).ConfigureAwait(false);
    }

    private static string NormalizeSynchronous(string? value)
    {
        var candidate = (value ?? string.Empty).Trim().ToUpperInvariant();
        return AllowedSynchronousModes.Contains(candidate, StringComparer.Ordinal) ? candidate : "NORMAL";
    }

    private static readonly string[] AllowedSynchronousModes = ["OFF", "NORMAL", "FULL", "EXTRA"];

    public void Dispose()
    {
        while (_idle.TryTake(out var connection))
        {
            connection.Dispose();
        }
    }
}
