using Microsoft.Data.Sqlite;

namespace DealsSeeker.Api.Persistence;

/// <summary>
/// A pooled SQLite connection lease. Disposing the lease returns the connection to the pool
/// instead of closing it.
/// </summary>
public sealed class SqliteConnectionLease : IAsyncDisposable
{
    private readonly SqliteConnectionPool _pool;
    private SqliteConnection? _connection;

    internal SqliteConnectionLease(SqliteConnectionPool pool, SqliteConnection connection)
    {
        _pool = pool;
        _connection = connection;
    }

    /// <summary>The live connection. Throws once the lease has been disposed.</summary>
    public SqliteConnection Connection =>
        _connection ?? throw new ObjectDisposedException(nameof(SqliteConnectionLease));

    public ValueTask DisposeAsync()
    {
        var connection = _connection;
        _connection = null;
        if (connection is not null)
        {
            _pool.Return(connection);
        }

        return ValueTask.CompletedTask;
    }
}
