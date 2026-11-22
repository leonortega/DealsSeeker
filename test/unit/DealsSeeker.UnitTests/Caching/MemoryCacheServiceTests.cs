using DealsSeeker.Api.Caching;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DealsSeeker.UnitTests.Caching;

public class MemoryCacheServiceTests
{
    private static MemoryCacheService CreateService(IMemoryCache cache) =>
        new(cache, NullLogger<MemoryCacheService>.Instance);

    [Fact]
    public async Task GetAsync_ReturnsDefault_WhenKeyAbsent()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);

        Assert.Null(await service.GetAsync<string>("missing", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task SetThenGet_ReturnsStoredValue()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);

        service.Set("key", "value", TimeSpan.FromMinutes(1));

        Assert.Equal("value", await service.GetAsync<string>("key", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Set_WithNonPositiveTtl_DoesNotStoreValue()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);

        service.Set("key", "value", TimeSpan.Zero);
        service.Set("key2", "value", TimeSpan.FromSeconds(-1));

        Assert.Null(await service.GetAsync<string>("key", TestContext.Current.CancellationToken));
        Assert.Null(await service.GetAsync<string>("key2", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Remove_DeletesStoredValue()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);
        service.Set("key", "value", TimeSpan.FromMinutes(1));

        service.Remove("key");

        Assert.Null(await service.GetAsync<string>("key", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetAsync_WithCancelledToken_StillReturnsCachedValue()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);
        service.Set("key", 42, TimeSpan.FromMinutes(1));
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        Assert.Equal(42, await service.GetAsync<int>("key", cts.Token));
    }
}
