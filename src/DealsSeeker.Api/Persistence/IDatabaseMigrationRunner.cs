namespace DealsSeeker.Api.Persistence;

public interface IDatabaseMigrationRunner
{
    Task ApplyMigrationsAsync(CancellationToken cancellationToken);
}
