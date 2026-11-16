using DealsSeeker.Api.Security;
using DealsSeeker.Api.Services.Offers;
using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Offers;

namespace DealsSeeker.Api.Endpoints;

public static class OfferEndpoints
{
    public static IEndpointRouteBuilder MapOfferEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/offers");

        group.MapPost("/search", async (
                SearchOffersRequest request,
                ICurrentUser currentUser,
                IOfferService offers,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var response = await offers.SearchAsync(request, profile.UserId, cancellationToken);
                return Results.Ok(response);
            })
            .WithValidation<SearchOffersRequest>()
            .RequireAuthorization()
            .RequireRateLimiting("search")
            .WithName("SearchOffers")
            .WithSummary("OFFERS.SEARCH.001 + OFFERS.SEARCH.SMART.001 + OFFERS.FAVORITES.001: Search offers with smart ranking and current-user state.");

        group.MapPost("/{offerId}/availability", async (
                string offerId,
                OfferAvailabilityVoteRequest request,
                ICurrentUser currentUser,
                IOfferService offers,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var result = await offers.VoteAvailabilityAsync(offerId, profile.UserId, request, cancellationToken);
                if (result.Success)
                {
                    return Results.Ok(result);
                }

                return result.Message.StartsWith("Offer not found.", StringComparison.OrdinalIgnoreCase)
                    ? Results.NotFound(result)
                    : Results.BadRequest(result);
            })
            .RequireAuthorization()
            .WithName("VoteOfferAvailability")
            .WithSummary("OFFERS.LIST.ACTIONS.001: Register thumbs up/down availability feedback counters, one vote per user.");

        group.MapPost("/{offerId}/report", async (
                string offerId,
                ReportOfferRequest request,
                IOfferService offers,
                CancellationToken cancellationToken) =>
            {
                var result = await offers.ReportAsync(offerId, request, cancellationToken);
                return result.Success ? Results.Ok(result) : Results.NotFound(result);
            })
            .WithValidation<ReportOfferRequest>()
            .WithName("ReportOffer")
            .WithSummary("OFFERS.LIST.ACTIONS.001: Report an offer.");

        group.MapPost("/{offerId}/favorite", async (
                string offerId,
                SetFavoriteRequest request,
                ICurrentUser currentUser,
                IOfferService offers,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var result = await offers.SetFavoriteAsync(offerId, profile.UserId, request, cancellationToken);
                if (result.Success)
                {
                    return Results.Ok(result);
                }

                return result.Message.StartsWith("Offer not found.", StringComparison.OrdinalIgnoreCase)
                    ? Results.NotFound(result)
                    : Results.BadRequest(result);
            })
            .RequireAuthorization()
            .WithName("SetFavorite")
            .WithSummary("OFFERS.FAVORITES.001: Save or remove offer from user favorites.");

        group.MapPost("/", async (
                AddOfferRequest request,
                ICurrentUser currentUser,
                IOfferService offers,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var result = await offers.AddAsync(request, profile.UserId, cancellationToken);
                return Results.Created($"/api/offers/{result.OfferId}", result);
            })
            .WithValidation<AddOfferRequest>()
            .RequireAuthorization()
            .WithName("CreateOffer")
            .WithSummary("ADD.OFFER.*: Create a new offer from add-offer view inputs.");

        group.MapPut("/{offerId}", async (
                string offerId,
                AddOfferRequest request,
                ICurrentUser currentUser,
                IOfferService offers,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var result = await offers.UpdateAsync(offerId, request, profile.UserId, cancellationToken);
                return result is null ? Results.NotFound() : Results.Ok(result);
            })
            .WithValidation<AddOfferRequest>()
            .RequireAuthorization()
            .WithName("UpdateOffer")
            .WithSummary("ACCOUNT.PROFILE.001 + ADD.OFFER.LAYOUT.001: Update a user-owned offer from edit mode.");

        group.MapDelete("/{offerId}", async (
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

                var result = await offers.DeleteAsync(offerId, profile.UserId, cancellationToken);
                return result.Success ? Results.Ok(result) : Results.NotFound(result);
            })
            .RequireAuthorization()
            .WithName("DeleteOffer")
            .WithSummary("ACCOUNT.PROFILE.001: Delete a user-owned offer after confirmation.");

        return app;
    }
}
