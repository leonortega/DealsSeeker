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

CREATE INDEX IF NOT EXISTS idx_logs_timestamp_utc ON logs(timestamp_utc);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
