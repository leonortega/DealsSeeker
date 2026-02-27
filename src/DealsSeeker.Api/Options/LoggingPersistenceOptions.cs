using Serilog.Events;

namespace DealsSeeker.Api.Options;

public sealed class LoggingPersistenceOptions
{
    public const string SectionName = "LoggingPersistence";

    public bool EnableDatabaseSink { get; init; } = true;

    public string MinimumLevel { get; init; } = nameof(LogEventLevel.Information);

    public LogEventLevel ResolveMinimumLevel()
    {
        return Enum.TryParse<LogEventLevel>(MinimumLevel, ignoreCase: true, out var level)
            ? level
            : LogEventLevel.Information;
    }
}
