namespace DealsSeeker.Api.Options;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string ConnectionString { get; init; } = "Data Source=Data/dealseeker.db";

    /// <summary>Milliseconds a blocked statement waits for the write lock before failing.</summary>
    public int BusyTimeoutMs { get; init; } = 5000;

    /// <summary>SQLite journal mode. "WAL" allows readers and the writer to proceed concurrently.</summary>
    public string JournalMode { get; init; } = "WAL";

    /// <summary>SQLite synchronous level. "NORMAL" is durable under WAL except on OS/power loss.</summary>
    public string Synchronous { get; init; } = "NORMAL";

    /// <summary>Negative values express a page-cache size in KiB (e.g. -64000 = 64 MiB).</summary>
    public int CacheSizeKb { get; init; } = -64000;

    /// <summary>Memory-mapped I/O size in bytes. 0 disables it.</summary>
    public long MmapSizeBytes { get; init; } = 268_435_456;
}
