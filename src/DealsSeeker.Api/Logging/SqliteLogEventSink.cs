using System.Text.Json;
using System.Threading.Channels;
using Dapper;
using DealsSeeker.Api.Options;
using DealsSeeker.Api.Persistence;
using Microsoft.Data.Sqlite;
using Serilog.Core;
using Serilog.Events;

namespace DealsSeeker.Api.Logging;

/// <summary>
/// Persists log events to a SQLite database without blocking the request thread.
/// </summary>
/// <remarks>
/// <para>
/// The sink buffers events in a bounded channel and a single background writer drains the buffer in
/// batches, writing each batch with one multi-row insert. The request thread therefore performs no
/// database I/O at all.
/// </para>
/// <para>
/// The log database must be a different file from the business database. Sharing one file means log
/// writes take the same global write lock as business writes, which serialises them and is the main
/// source of "database is locked" failures under load.
/// </para>
/// </remarks>
public sealed class SqliteLogEventSink : ILogEventSink, IDisposable
{
    private const string InsertSql =
        """
        INSERT INTO logs (
            timestamp_utc,
            level,
            message_template,
            rendered_message,
            exception,
            properties_json,
            source_context,
            trace_id,
            span_id
        ) VALUES (
            @TimestampUtc,
            @Level,
            @MessageTemplate,
            @RenderedMessage,
            @Exception,
            @PropertiesJson,
            @SourceContext,
            @TraceId,
            @SpanId
        )
        """;

    private readonly Channel<LogEvent> _channel;
    private readonly CancellationTokenSource _shutdown = new();
    private readonly Task _writerTask;
    private readonly string _connectionString;
    private readonly int _batchSize;
    private readonly TimeSpan _flushInterval;
    private readonly int _retentionDays;
    private readonly TimeSpan _pruneInterval;
    private readonly ILogger<SqliteLogEventSink> _logger;
    private long _droppedCount;

    public SqliteLogEventSink(
        string connectionString,
        string contentRootPath,
        LoggingPersistenceOptions options,
        ILogger<SqliteLogEventSink> logger)
    {
        _connectionString = SqlitePathResolver.NormalizeConnectionString(connectionString, contentRootPath);
        _batchSize = Math.Max(1, options.BatchSize);
        _flushInterval = TimeSpan.FromMilliseconds(Math.Max(10, options.FlushIntervalMs));
        _retentionDays = Math.Max(1, options.RetentionDays);
        _pruneInterval = TimeSpan.FromMinutes(Math.Max(1, options.PruneIntervalMinutes));
        _logger = logger;

        _channel = Channel.CreateBounded<LogEvent>(new BoundedChannelOptions(Math.Max(_batchSize * 4, 1024))
        {
            FullMode = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
            SingleWriter = false
        });

        _writerTask = Task.Run(() => WriteLoopAsync(_shutdown.Token));
    }

    /// <summary>Number of events discarded because the buffer was full.</summary>
    public long DroppedCount => Interlocked.Read(ref _droppedCount);

    public void Emit(LogEvent logEvent)
    {
        if (!_channel.Writer.TryWrite(logEvent))
        {
            Interlocked.Increment(ref _droppedCount);
        }
    }

    private async Task WriteLoopAsync(CancellationToken cancellationToken)
    {
        var buffer = new List<LogEvent>(_batchSize);
        SqliteConnection? connection = null;
        var nextPruneAt = DateTime.UtcNow + _pruneInterval;

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    buffer.Clear();
                    if (!await _channel.Reader.WaitToReadAsync(cancellationToken).ConfigureAwait(false))
                    {
                        break;
                    }

                    if (!_channel.Reader.TryRead(out var first))
                    {
                        continue;
                    }

                    buffer.Add(first);

                    // Give the batch a short window to fill before writing it.
                    using var batchWindow = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                    batchWindow.CancelAfter(_flushInterval);
                    while (buffer.Count < _batchSize)
                    {
                        try
                        {
                            if (!await _channel.Reader.WaitToReadAsync(batchWindow.Token).ConfigureAwait(false))
                            {
                                break;
                            }
                        }
                        catch (OperationCanceledException)
                        {
                            break;
                        }

                        if (!_channel.Reader.TryRead(out var next))
                        {
                            break;
                        }

                        buffer.Add(next);
                    }

                    connection = await WriteBatchAsync(connection, buffer, cancellationToken).ConfigureAwait(false);

                    if (DateTime.UtcNow >= nextPruneAt)
                    {
                        nextPruneAt = DateTime.UtcNow + _pruneInterval;
                        await PruneAsync(connection, cancellationToken).ConfigureAwait(false);
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    // A failing log sink must never take the API down.
                    _logger.LogWarning(ex, "Failed to persist a batch of log events to the log database.");
                    connection?.Dispose();
                    connection = null;
                }
            }

            // Final flush of whatever is still buffered.
            while (_channel.Reader.TryRead(out var pending))
            {
                buffer.Clear();
                buffer.Add(pending);
                connection = await WriteBatchAsync(connection, buffer, CancellationToken.None).ConfigureAwait(false);
            }
        }
        finally
        {
            connection?.Dispose();
        }
    }

    private async Task<SqliteConnection> WriteBatchAsync(
        SqliteConnection? connection,
        IReadOnlyCollection<LogEvent> events,
        CancellationToken cancellationToken)
    {
        if (events.Count == 0)
        {
            return connection ?? await OpenConnectionAsync(cancellationToken).ConfigureAwait(false);
        }

        connection ??= await OpenConnectionAsync(cancellationToken).ConfigureAwait(false);

        var rows = events.Select(ToRow).ToArray();
        await connection.ExecuteAsync(InsertSql, rows).ConfigureAwait(false);
        return connection;
    }

    private async Task<SqliteConnection> OpenConnectionAsync(CancellationToken cancellationToken)
    {
        var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await connection.ExecuteAsync(
            """
            PRAGMA foreign_keys = ON;
            PRAGMA busy_timeout = 5000;
            PRAGMA synchronous = NORMAL;
            PRAGMA journal_mode = WAL;
            """).ConfigureAwait(false);

        await connection.ExecuteAsync(
            """
            CREATE TABLE IF NOT EXISTS logs (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp_utc TEXT NOT NULL,
                level TEXT NOT NULL,
                message_template TEXT NOT NULL,
                rendered_message TEXT NOT NULL,
                exception TEXT NULL,
                properties_json TEXT NULL,
                source_context TEXT NULL,
                trace_id TEXT NULL,
                span_id TEXT NULL
            );
            """).ConfigureAwait(false);

        return connection;
    }

    private async Task PruneAsync(SqliteConnection connection, CancellationToken cancellationToken)
    {
        var cutoff = DateTimeOffset.UtcNow.AddDays(-_retentionDays).ToString("O");
        var deleted = await connection.ExecuteAsync(
            "DELETE FROM logs WHERE timestamp_utc < @Cutoff;",
            new { Cutoff = cutoff }).ConfigureAwait(false);

        if (deleted > 0)
        {
            _logger.LogInformation("Pruned {DeletedCount} expired log rows.", deleted);
        }
    }

    private static LogRow ToRow(LogEvent logEvent)
    {
        return new LogRow(
            TimestampUtc: logEvent.Timestamp.UtcDateTime.ToString("O"),
            Level: logEvent.Level.ToString(),
            MessageTemplate: logEvent.MessageTemplate.Text,
            RenderedMessage: logEvent.RenderMessage(),
            Exception: logEvent.Exception?.ToString(),
            PropertiesJson: SerializeProperties(logEvent),
            SourceContext: GetProperty(logEvent, "SourceContext"),
            TraceId: GetProperty(logEvent, "TraceId"),
            SpanId: GetProperty(logEvent, "SpanId"));
    }

    private static string SerializeProperties(LogEvent logEvent)
    {
        var payload = logEvent.Properties.ToDictionary(
            x => x.Key,
            x => x.Value.ToString());
        return JsonSerializer.Serialize(payload);
    }

    private static string? GetProperty(LogEvent logEvent, string name)
    {
        if (!logEvent.Properties.TryGetValue(name, out var value))
        {
            return null;
        }

        var rendered = value.ToString();
        if (rendered.Length >= 2 && rendered[0] == '"' && rendered[^1] == '"')
        {
            return rendered[1..^1];
        }

        return rendered;
    }

    public void Dispose()
    {
        _shutdown.Cancel();
        try
        {
            _writerTask.Wait(TimeSpan.FromSeconds(5));
        }
        catch (AggregateException)
        {
            // The writer was cancelled; nothing else to do.
        }

        _shutdown.Dispose();
    }

    private sealed record LogRow(
        string TimestampUtc,
        string Level,
        string MessageTemplate,
        string RenderedMessage,
        string? Exception,
        string PropertiesJson,
        string? SourceContext,
        string? TraceId,
        string? SpanId);
}
