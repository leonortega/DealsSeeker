using Dapper;
using DealsSeeker.Api.Persistence;

namespace DealsSeeker.Api.Maintenance;

/// <summary>
/// Periodic database housekeeping: removes expired sessions and expired promotions.
/// </summary>
/// <remarks>
/// Without this, the session table and the promotion table grow without bound, which slows the
/// lookups that read them. The sweep runs on a timer and never overlaps with itself.
/// </remarks>
public sealed class DatabaseJanitor(
    IDbConnectionFactory connectionFactory,
    ILogger<DatabaseJanitor> logger) : BackgroundService
{
    private static readonly TimeSpan SweepInterval = TimeSpan.FromMinutes(15);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(SweepInterval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            try
            {
                await SweepAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Database housekeeping sweep failed.");
            }
        }
    }

    private async Task SweepAsync(CancellationToken cancellationToken)
    {
        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;

        var now = Timestamp.NowUtc();
        var expiredSessions = await connection.ExecuteAsync(
            """
            DELETE FROM auth_sessions
            WHERE expires_at_utc < @Now
               OR (revoked_at_utc IS NOT NULL AND revoked_at_utc < @RevokedCutoff);
            """,
            new { Now = now, RevokedCutoff = DateTimeOffset.UtcNow.AddDays(-7).ToString("O") });

        var expiredPromotions = await connection.ExecuteAsync(
            """
            DELETE FROM promoted_offers
            WHERE ends_at_utc IS NOT NULL AND ends_at_utc < @Now;
            """,
            new { Now = now });

        if (expiredSessions > 0 || expiredPromotions > 0)
        {
            logger.LogInformation(
                "Database housekeeping removed {SessionCount} expired sessions and {PromotionCount} expired promotions.",
                expiredSessions,
                expiredPromotions);
        }

        await connection.ExecuteAsync("PRAGMA wal_checkpoint(PASSIVE);");
    }
}
