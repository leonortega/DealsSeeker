using Dapper;
using DealsSeeker.Api.Options;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

namespace DealsSeeker.Api.Persistence;

public sealed class SqliteConnectionFactory(
    IOptions<DatabaseOptions> options,
    IHostEnvironment environment) : IDbConnectionFactory
{
    private readonly DatabaseOptions _options = options.Value;

    public async Task<SqliteConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken)
    {
        var connectionString = BuildConnectionString();
        var connection = new SqliteConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        await connection.ExecuteAsync("PRAGMA foreign_keys = ON;");
        return connection;
    }

    private string BuildConnectionString()
    {
        return SqlitePathResolver.NormalizeConnectionString(_options.ConnectionString, environment.ContentRootPath);
    }
}
