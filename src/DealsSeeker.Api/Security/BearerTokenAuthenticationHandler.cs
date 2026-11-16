using System.Security.Claims;
using System.Text.Encodings.Web;
using DealsSeeker.Api.Services.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace DealsSeeker.Api.Security;

/// <summary>
/// Resolves the bearer token of the request into the authenticated caller.
/// </summary>
/// <remarks>
/// The session lookup happens once per request and its result is cached, so an authenticated request
/// no longer needs one database round trip for the profile plus another for the operation itself.
/// </remarks>
public sealed class BearerTokenAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IAuthService authService,
    ISessionCache sessionCache)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Bearer";
    public const string AccessTokenClaimType = "access_token";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var accessToken = ExtractAccessToken(Request);
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return AuthenticateResult.NoResult();
        }

        var profile = sessionCache.Get(accessToken);
        if (profile is null)
        {
            profile = await authService.GetProfileByTokenAsync(accessToken, Context.RequestAborted);
            if (profile is null)
            {
                return AuthenticateResult.Fail("The session token is not valid.");
            }

            sessionCache.Set(accessToken, profile);
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, profile.UserId),
            new Claim(ClaimTypes.Name, profile.DisplayName),
            new Claim(ClaimTypes.Email, profile.Email),
            new Claim(AccessTokenClaimType, accessToken)
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        return AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    }

    private static string? ExtractAccessToken(HttpRequest request)
    {
        const string bearerPrefix = "Bearer ";
        var authorizationHeader = request.Headers.Authorization.ToString();
        if (!authorizationHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var token = authorizationHeader[bearerPrefix.Length..].Trim();
        return string.IsNullOrWhiteSpace(token) ? null : token;
    }
}
