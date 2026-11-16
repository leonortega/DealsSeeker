namespace DealsSeeker.Api.Persistence;

public interface IDbConnectionFactory
{
    /// <summary>
    /// Rents a pooled, open connection. Disposing the returned lease returns the connection to the pool.
    /// </summary>
    Task<SqliteConnectionLease> RentAsync(CancellationToken cancellationToken);
}
