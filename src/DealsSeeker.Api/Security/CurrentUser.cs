using System.Security.Claims;
using DealsSeeker.Shared.Contracts.Account;

namespace DealsSeeker.Api.Security;

/// <summary>
/// The identity of the caller of the current request, resolved once by the authentication handler.
/// </summary>
public interface ICurrentUser
{
    bool IsAuthenticated { get; }

    string? UserId { get; }

    string? DisplayName { get; }

    string? Email { get; }

    /// <summary>The bearer token the caller presented, when there is one.</summary>
    string? AccessToken { get; }

    UserProfileDto? Profile { get; }
}

/// <summary>Reads the current caller from the authenticated principal of the request.</summary>
public sealed class CurrentUser(IHttpContextAccessor httpContextAccessor, ISessionCache sessionCache) : ICurrentUser
{
    private UserProfileDto? _profile;
    private bool _resolved;

    public bool IsAuthenticated =>
        HttpContext.User.Identity?.IsAuthenticated == true;

    public string? UserId => HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? DisplayName => Profile?.DisplayName;

    public string? Email => Profile?.Email;

    /// <summary>The bearer token the caller presented, when there is one.</summary>
    public string? AccessToken => HttpContext.User.FindFirstValue("access_token");

    public UserProfileDto? Profile
    {
        get
        {
            if (!_resolved)
            {
                _profile = ResolveProfile();
                _resolved = true;
            }

            return _profile;
        }
    }

    private UserProfileDto? ResolveProfile()
    {
        var accessToken = HttpContext.User.FindFirstValue("access_token");
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return null;
        }

        return sessionCache.Get(accessToken);
    }

    private HttpContext HttpContext =>
        httpContextAccessor.HttpContext ?? throw new InvalidOperationException("No active HTTP context.");
}
