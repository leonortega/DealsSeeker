using DealsSeeker.Shared.Contracts.Account;

namespace DealsSeeker.Api.Security;

/// <summary>
/// Short-lived cache of resolved sessions, so that the common request does not need a database round trip.
/// </summary>
public interface ISessionCache
{
    /// <summary>Returns the cached profile for the token, or null when it is not cached.</summary>
    UserProfileDto? Get(string accessToken);

    /// <summary>Caches a resolved profile for the token.</summary>
    void Set(string accessToken, UserProfileDto profile);

    /// <summary>Marks the token as revoked so it is rejected immediately.</summary>
    void Revoke(string accessToken);
}
