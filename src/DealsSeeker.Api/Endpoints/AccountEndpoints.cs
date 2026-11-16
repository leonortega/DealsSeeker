using DealsSeeker.Api.Responses;
using DealsSeeker.Api.Security;
using DealsSeeker.Api.Services.Auth;
using DealsSeeker.Api.Services.Offers;
using DealsSeeker.Shared.Contracts.Account;

namespace DealsSeeker.Api.Endpoints;

public static class AccountEndpoints
{
    public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/account");

        group.MapGet("/me", async (
                ICurrentUser currentUser,
                HttpContext httpContext,
                ConditionalResponseService conditional,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                // The key carries the caller identity, so one caller is never answered with
                // another caller's representation.
                var cacheKey = $"conditional:profile:{profile.UserId}";
                if (await conditional.TryNotModifiedAsync(cacheKey, httpContext, TimeSpan.FromSeconds(30), cancellationToken))
                {
                    return Results.Empty;
                }

                return conditional.Respond(profile, cacheKey, httpContext, TimeSpan.FromSeconds(30));
            })
            .RequireAuthorization()
            .WithName("GetMyAccountProfile")
            .WithSummary("ACCOUNT.PROFILE.001: Get profile for authenticated user.");

        group.MapPut("/me/avatar", async (
                SetAvatarRequest request,
                ICurrentUser currentUser,
                IAuthService auth,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var result = await auth.UpdateAvatarAsync(profile.UserId, request, cancellationToken);
                return result.Success ? Results.Ok(result) : Results.BadRequest(result);
            })
            .RequireAuthorization()
            .WithName("SetMyAvatar")
            .WithSummary("ACCOUNT.PROFILE.AVATAR.001: Save the preset avatar of the authenticated user.");

        group.MapGet("/offers", async (ICurrentUser currentUser, IOfferService offers, CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var response = await offers.GetOwnedOffersAsync(profile.UserId, cancellationToken);
                return Results.Ok(response);
            })
            .RequireAuthorization()
            .WithName("GetMyOffers")
            .WithSummary("ACCOUNT.PROFILE.001: Get offers created by the authenticated user.");

        group.MapGet("/offers/{offerId}", async (
                string offerId,
                ICurrentUser currentUser,
                IOfferService offers,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var draft = await offers.GetOwnedOfferDraftAsync(offerId, profile.UserId, cancellationToken);
                return draft is null ? Results.NotFound() : Results.Ok(draft);
            })
            .RequireAuthorization()
            .WithName("GetMyOfferDraft")
            .WithSummary("ACCOUNT.PROFILE.001 + ADD.OFFER.LAYOUT.001: Get editable draft data for a user-owned offer.");

        return app;
    }
}
