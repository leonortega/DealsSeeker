using System.Security.Claims;
using DealsSeeker.Api.Security;
using DealsSeeker.Shared.Contracts.Account;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace DealsSeeker.UnitTests.Security;

public class CurrentUserTests
{
    private sealed class StubSessionCache(UserProfileDto? profile) : ISessionCache
    {
        public int GetCalls { get; private set; }
        public UserProfileDto? Get(string accessToken)
        {
            GetCalls++;
            return profile;
        }
        public void Set(string accessToken, UserProfileDto profile) { }
        public void Revoke(string accessToken) { }
    }

    private sealed class StubAccessor(HttpContext context) : IHttpContextAccessor
    {
        public HttpContext? HttpContext { get; set; } = context;
    }

    private static CurrentUser CreateUser(HttpContext context, ISessionCache cache) =>
        new(new StubAccessor(context), cache);

    private static DefaultHttpContext ContextWithClaims(params Claim[] claims)
    {
        var context = new DefaultHttpContext();
        context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
        return context;
    }

    [Fact]
    public void IsAuthenticated_ReflectsPrincipalIdentity()
    {
        var anonymousContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) };
        var anonymous = CreateUser(anonymousContext, new StubSessionCache(null));
        var authenticated = CreateUser(
            ContextWithClaims(new Claim(ClaimTypes.NameIdentifier, "usr-1")),
            new StubSessionCache(null));

        Assert.False(anonymous.IsAuthenticated);
        Assert.True(authenticated.IsAuthenticated);
    }

    [Fact]
    public void IdentityProperties_ReadClaimsAndResolvedProfile()
    {
        var context = ContextWithClaims(
            new Claim(ClaimTypes.NameIdentifier, "usr-1"),
            new Claim("access_token", "tok-1"));
        var profile = new UserProfileDto("usr-1", "Ada", "ada@example.com", "cat");
        var user = CreateUser(context, new StubSessionCache(profile));

        Assert.Equal("usr-1", user.UserId);
        Assert.Equal("tok-1", user.AccessToken);
        Assert.Equal("Ada", user.DisplayName);
        Assert.Equal("ada@example.com", user.Email);
        Assert.Equal(profile, user.Profile);
    }

    [Fact]
    public void Profile_IsResolvedOnceAndReused()
    {
        var context = ContextWithClaims(new Claim("access_token", "tok-1"));
        var cache = new StubSessionCache(new UserProfileDto("usr-1", "Ada", "a@b.c", "smile"));
        var user = CreateUser(context, cache);

        _ = user.Profile;
        _ = user.Profile;

        Assert.Equal(1, cache.GetCalls);
    }

    [Fact]
    public void Profile_IsNull_WhenAccessTokenMissing()
    {
        var context = ContextWithClaims(new Claim(ClaimTypes.NameIdentifier, "usr-1"));
        var cache = new StubSessionCache(new UserProfileDto("usr-1", "Ada", "a@b.c", "smile"));

        Assert.Null(CreateUser(context, cache).Profile);
        Assert.Equal(0, cache.GetCalls);
    }

    [Fact]
    public void Properties_Throw_WhenNoHttpContext()
    {
        var user = new CurrentUser(new StubAccessor(null!), new StubSessionCache(null));

        Assert.Throws<InvalidOperationException>(() => user.IsAuthenticated);
    }
}
