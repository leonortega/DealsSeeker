using DealsSeeker.Api.Security;
using DealsSeeker.Api.Services.Auth;
using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Contracts.Account;

namespace DealsSeeker.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth");

        group.MapPost("/register", async (
                RegisterUserRequest request,
                IAuthService auth,
                ILoggerFactory loggerFactory,
                CancellationToken cancellationToken) =>
            {
                loggerFactory.CreateLogger("DealsSeeker.Auth")
                    .LogInformation("Register request received for email {Email}", request.Email);

                var result = await auth.RegisterAsync(request, cancellationToken);
                return result.Success ? Results.Ok(result) : Results.BadRequest(result);
            })
            .WithValidation<RegisterUserRequest>()
            .WithName("RegisterUser")
            .WithSummary("ACCOUNT.AUTH.REGISTER.001: Create a new user account.");

        group.MapPost("/login", async (LoginRequest request, IAuthService auth, CancellationToken cancellationToken) =>
            {
                var session = await auth.LoginAsync(request, cancellationToken);
                return session is null ? Results.Unauthorized() : Results.Ok(session);
            })
            .WithValidation<LoginRequest>()
            .WithName("LoginUser")
            .WithSummary("ACCOUNT.AUTH.LOGIN.001: Authenticate user and start session.");

        group.MapPost("/logout", async (
                ICurrentUser currentUser,
                IAuthService auth,
                ISessionCache sessionCache,
                CancellationToken cancellationToken) =>
            {
                var accessToken = currentUser.AccessToken;
                if (string.IsNullOrWhiteSpace(accessToken))
                {
                    return Results.Unauthorized();
                }

                var result = await auth.LogoutAsync(accessToken, cancellationToken);

                // The session is revoked in the cache immediately, so it stops working before the
                // cache entry would have expired.
                sessionCache.Revoke(accessToken);

                return result.Success ? Results.Ok(result) : Results.Unauthorized();
            })
            .RequireAuthorization()
            .WithName("LogoutUser")
            .WithSummary("ACCOUNT.PROFILE.001: End authenticated session.");

        return app;
    }
}
