using Microsoft.Extensions.Caching.Memory;

namespace DealsSeeker.Api.Caching;

/// <summary>
/// A small, observable cache abstraction over the in-memory cache.
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);

    void Set<T>(string key, T value, TimeSpan timeToLive);

    void Remove(string key);
}

/// <summary>
/// In-memory cache implementation with hit/miss counters per key prefix.
/// </summary>
/// <remarks>
/// Only user-independent data is cached here. Anything that varies per caller must not be cached,
/// because a cached value could otherwise be served to the wrong caller.
/// </remarks>
public sealed class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly System.Diagnostics.Metrics.Meter _meter;
    private readonly ILogger<MemoryCacheService> _logger;

    public MemoryCacheService(IMemoryCache cache, ILogger<MemoryCacheService> logger)
    {
        _cache = cache;
        _logger = logger;
        _meter = new System.Diagnostics.Metrics.Meter("DealsSeeker.Api.Cache");
    }

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(key, out T? value) && value is not null)
        {
            RecordHit(key);
            return Task.FromResult<T?>(value);
        }

        RecordMiss(key);
        return Task.FromResult<T?>(default);
    }

    public void Set<T>(string key, T value, TimeSpan timeToLive)
    {
        if (timeToLive <= TimeSpan.Zero)
        {
            return;
        }

        _cache.Set(key, value, timeToLive);
    }

    public void Remove(string key) => _cache.Remove(key);

    private void RecordHit(string key) =>
        _meter.CreateCounter<long>("dealseeker.cache.operations", "b", "Cache operations.")
            .Add(1, new KeyValuePair<string, object?>("outcome", "hit"), new KeyValuePair<string, object?>("key", Prefix(key)));

    private void RecordMiss(string key) =>
        _meter.CreateCounter<long>("dealseeker.cache.operations", "b", "Cache operations.")
            .Add(1, new KeyValuePair<string, object?>("outcome", "miss"), new KeyValuePair<string, object?>("key", Prefix(key)));

    private static string Prefix(string key)
    {
        var separator = key.IndexOf(':', StringComparison.Ordinal);
        return separator < 0 ? key : key[..separator];
    }
}
