using DealsSeeker.Shared.Contracts.Account;
using Microsoft.Extensions.Caching.Memory;

namespace DealsSeeker.Api.Security;

/// <summary>
/// In-memory session cache with a short time-to-live.
/// </summary>
/// <remarks>
/// The time-to-live bounds how long a revoked or disabled session can still be honoured, which is why
/// <see cref="Revoke"/> writes an explicit tombstone: logout is then effective immediately rather than
/// after the cache entry expires.
/// </remarks>
public sealed class MemorySessionCache : ISessionCache
{
    private static readonly TimeSpan SessionTtl = TimeSpan.FromSeconds(60);

    private readonly IMemoryCache _cache;

    public MemorySessionCache(IMemoryCache cache)
    {
        _cache = cache;
    }

    public UserProfileDto? Get(string accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return null;
        }

        if (_cache.TryGetValue(RevocationKey(accessToken), out _))
        {
            return null;
        }

        return _cache.TryGetValue(SessionKey(accessToken), out UserProfileDto? profile) ? profile : null;
    }

    public void Set(string accessToken, UserProfileDto profile)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return;
        }

        _cache.Set(SessionKey(accessToken), profile, SessionTtl);
    }

    public void Revoke(string accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return;
        }

        _cache.Set(RevocationKey(accessToken), true, SessionTtl);
        _cache.Remove(SessionKey(accessToken));
    }

    private static string SessionKey(string accessToken) => $"session:{accessToken}";

    private static string RevocationKey(string accessToken) => $"session-revoked:{accessToken}";
}
