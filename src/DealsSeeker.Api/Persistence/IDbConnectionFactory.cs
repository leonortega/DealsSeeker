using Microsoft.Data.Sqlite;

namespace DealsSeeker.Api.Persistence;

public interface IDbConnectionFactory
{
    Task<SqliteConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken);
}
