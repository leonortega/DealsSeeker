using DealsSeeker.Api.Security;
using DealsSeeker.Shared.Contracts.Account;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace DealsSeeker.UnitTests.Security;

public class MemorySessionCacheTests
{
    private static readonly UserProfileDto Profile = new("usr-1", "Ada", "ada@example.com", "smile");

    private static MemorySessionCache CreateCache(IMemoryCache memoryCache) => new(memoryCache);

    [Fact]
    public void SetThenGet_ReturnsProfile()
    {
        using var memory = new MemoryCache(new MemoryCacheOptions());
        var cache = CreateCache(memory);

        cache.Set("token", Profile);

        Assert.Equal(Profile, cache.Get("token"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void BlankTokens_AreIgnored(string? token)
    {
        using var memory = new MemoryCache(new MemoryCacheOptions());
        var cache = CreateCache(memory);

        cache.Set(token!, Profile);
        cache.Revoke(token!);

        Assert.Null(cache.Get(token!));
    }

    [Fact]
    public void Get_ReturnsNull_ForUnknownToken()
    {
        using var memory = new MemoryCache(new MemoryCacheOptions());

        Assert.Null(CreateCache(memory).Get("unknown"));
    }

    [Fact]
    public void Revoke_RemovesSessionAndWritesTombstone()
    {
        using var memory = new MemoryCache(new MemoryCacheOptions());
        var cache = CreateCache(memory);
        cache.Set("token", Profile);

        cache.Revoke("token");

        Assert.Null(cache.Get("token"));
        cache.Set("token", Profile);
        Assert.Null(cache.Get("token"));
    }
}
