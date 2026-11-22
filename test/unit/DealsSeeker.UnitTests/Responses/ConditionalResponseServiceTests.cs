using DealsSeeker.Api.Caching;
using DealsSeeker.Api.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace DealsSeeker.UnitTests.Responses;

public class ConditionalResponseServiceTests
{
    private static ConditionalResponseService CreateService(IMemoryCache cache) =>
        new(
            new MemoryCacheService(cache, NullLogger<MemoryCacheService>.Instance),
            Options.Create(new JsonOptions()));

    private static DefaultHttpContext ContextWithIfNoneMatch(string? value)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        if (value is not null)
        {
            context.Request.Headers.IfNoneMatch = value;
        }
        return context;
    }

    [Fact]
    public void Respond_SetsEtagAndCacheControlAndCachesValidator()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);
        var context = ContextWithIfNoneMatch(null);

        var result = service.Respond(new { name = "coffee" }, "key", context);

        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(context.Response.Headers.ETag));
        Assert.Equal("private, max-age=30", context.Response.Headers.CacheControl.ToString());
        Assert.True(cache.TryGetValue("key", out string? etag));
        Assert.Equal(context.Response.Headers.ETag.ToString(), etag);
    }

    [Fact]
    public async Task TryNotModifiedAsync_WithoutCachedValidator_ReturnsFalse()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var context = ContextWithIfNoneMatch("*");

        Assert.False(await CreateService(cache).TryNotModifiedAsync("key", context, cancellationToken: TestContext.Current.CancellationToken));
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
    }

    [Fact]
    public async Task TryNotModifiedAsync_MatchingValidator_Returns304()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);
        var first = ContextWithIfNoneMatch(null);
        service.Respond(new { name = "coffee" }, "key", first);
        var etag = first.Response.Headers.ETag.ToString();
        var second = ContextWithIfNoneMatch(etag);

        Assert.True(await service.TryNotModifiedAsync("key", second, cancellationToken: TestContext.Current.CancellationToken));
        Assert.Equal(StatusCodes.Status304NotModified, second.Response.StatusCode);
        Assert.Equal(etag, second.Response.Headers.ETag.ToString());
        Assert.Equal("private, max-age=30", second.Response.Headers.CacheControl.ToString());
    }

    [Fact]
    public async Task TryNotModifiedAsync_MatchesWildcardWeakAndMultipleValidators()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);
        var first = ContextWithIfNoneMatch(null);
        service.Respond(new { name = "coffee" }, "key", first);
        var etag = first.Response.Headers.ETag.ToString().Trim('"');

        Assert.True(await service.TryNotModifiedAsync("key", ContextWithIfNoneMatch("*"), cancellationToken: TestContext.Current.CancellationToken));
        Assert.True(await service.TryNotModifiedAsync("key", ContextWithIfNoneMatch($"W/\"{etag}\""), cancellationToken: TestContext.Current.CancellationToken));
        Assert.True(await service.TryNotModifiedAsync("key", ContextWithIfNoneMatch($"\"other\", \"{etag}\""), cancellationToken: TestContext.Current.CancellationToken));
        Assert.False(await service.TryNotModifiedAsync("key", ContextWithIfNoneMatch("\"different\""), cancellationToken: TestContext.Current.CancellationToken));
        Assert.False(await service.TryNotModifiedAsync("key", ContextWithIfNoneMatch("   "), cancellationToken: TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task TryNotModifiedAsync_UsesSuppliedMaxAge()
    {
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = CreateService(cache);
        var first = ContextWithIfNoneMatch(null);
        service.Respond(new { name = "coffee" }, "key", first, TimeSpan.FromMinutes(2));
        var second = ContextWithIfNoneMatch(first.Response.Headers.ETag.ToString());

        Assert.True(await service.TryNotModifiedAsync("key", second, TimeSpan.FromMinutes(2), TestContext.Current.CancellationToken));
        Assert.Equal("private, max-age=120", second.Response.Headers.CacheControl.ToString());
    }
}
