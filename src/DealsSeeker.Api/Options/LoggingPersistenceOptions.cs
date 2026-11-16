using Serilog.Events;

namespace DealsSeeker.Api.Options;

public sealed class LoggingPersistenceOptions
{
    public const string SectionName = "LoggingPersistence";

    /// <summary>
    /// Whether log events are persisted to the database. Disabled by default: log persistence
    /// competes with business data for the database write lock unless it is isolated.
    /// </summary>
    public bool EnableDatabaseSink { get; init; }

    /// <summary>
    /// Connection string for the log database. It must point at a different file than the business
    /// database so that log writes never contend with business writes.
    /// </summary>
    public string ConnectionString { get; init; } = "Data Source=Data/dealseeker-logs.db";

    public string MinimumLevel { get; init; } = nameof(LogEventLevel.Information);

    /// <summary>Maximum number of events written per database round trip.</summary>
    public int BatchSize { get; init; } = 500;

    /// <summary>Maximum time an event waits in the buffer before the batch is flushed.</summary>
    public int FlushIntervalMs { get; init; } = 200;

    /// <summary>How long log rows are retained before being pruned.</summary>
    public int RetentionDays { get; init; } = 14;

    /// <summary>How often the retention sweep runs.</summary>
    public int PruneIntervalMinutes { get; init; } = 60;

    public LogEventLevel ResolveMinimumLevel()
    {
        return Enum.TryParse<LogEventLevel>(MinimumLevel, ignoreCase: true, out var level)
            ? level
            : LogEventLevel.Information;
    }
}
