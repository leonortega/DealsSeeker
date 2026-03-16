using System.Text.Json;
using DealsSeeker.Api.Persistence;
using Microsoft.Data.Sqlite;
using Serilog.Core;
using Serilog.Events;

namespace DealsSeeker.Api.Logging;

public sealed class SqliteLogEventSink : ILogEventSink
{
    private readonly string _connectionString;
    private readonly object _sync = new();
    private volatile bool _tableReady;

    public SqliteLogEventSink(string connectionString, string contentRootPath)
    {
        _connectionString = SqlitePathResolver.NormalizeConnectionString(connectionString, contentRootPath);
    }

    public void Emit(LogEvent logEvent)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            EnsureTable(connection);

            using var command = connection.CreateCommand();
            command.CommandText =
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
                    @timestamp_utc,
                    @level,
                    @message_template,
                    @rendered_message,
                    @exception,
                    @properties_json,
                    @source_context,
                    @trace_id,
                    @span_id
                );
                """;

            command.Parameters.AddWithValue("@timestamp_utc", logEvent.Timestamp.UtcDateTime.ToString("O"));
            command.Parameters.AddWithValue("@level", logEvent.Level.ToString());
            command.Parameters.AddWithValue("@message_template", logEvent.MessageTemplate.Text);
            command.Parameters.AddWithValue("@rendered_message", logEvent.RenderMessage());
            command.Parameters.AddWithValue("@exception", (object?)logEvent.Exception?.ToString() ?? DBNull.Value);
            command.Parameters.AddWithValue("@properties_json", SerializeProperties(logEvent));
            command.Parameters.AddWithValue("@source_context", (object?)GetProperty(logEvent, "SourceContext") ?? DBNull.Value);
            command.Parameters.AddWithValue("@trace_id", (object?)GetProperty(logEvent, "TraceId") ?? DBNull.Value);
            command.Parameters.AddWithValue("@span_id", (object?)GetProperty(logEvent, "SpanId") ?? DBNull.Value);

            command.ExecuteNonQuery();
        }
        catch
        {
            // Keep sink failures isolated so API runtime is not affected.
        }
    }

    private void EnsureTable(SqliteConnection connection)
    {
        if (_tableReady)
        {
            return;
        }

        lock (_sync)
        {
            if (_tableReady)
            {
                return;
            }

            using var command = connection.CreateCommand();
            command.CommandText =
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
                """;
            command.ExecuteNonQuery();
            _tableReady = true;
        }
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
}
