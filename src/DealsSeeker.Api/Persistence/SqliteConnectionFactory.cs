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
        var builder = new SqliteConnectionStringBuilder(_options.ConnectionString);
        if (string.IsNullOrWhiteSpace(builder.DataSource) ||
            builder.DataSource.Equals(":memory:", StringComparison.OrdinalIgnoreCase))
        {
            return builder.ConnectionString;
        }

        if (!Path.IsPathRooted(builder.DataSource))
        {
            builder.DataSource = Path.GetFullPath(Path.Combine(environment.ContentRootPath, builder.DataSource));
        }

        var directory = Path.GetDirectoryName(builder.DataSource);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        return builder.ConnectionString;
    }
}
