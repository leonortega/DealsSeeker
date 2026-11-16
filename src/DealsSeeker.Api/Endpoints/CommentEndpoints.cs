using DealsSeeker.Api.Responses;
using DealsSeeker.Api.Security;
using DealsSeeker.Api.Services.Comments;
using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Contracts.Comments;

namespace DealsSeeker.Api.Endpoints;

public static class CommentEndpoints
{
    public static IEndpointRouteBuilder MapCommentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/offers");

        group.MapGet("/{offerId}/comments", async (
                string offerId,
                int? limit,
                string? after,
                ICurrentUser currentUser,
                HttpContext httpContext,
                ConditionalResponseService conditional,
                ICommentService comments,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                if (limit is < 1 or > RequestLimits.MaxCommentLimit)
                {
                    return ApiResults.ValidationProblem(ValidationErrors.For(
                        "limit",
                        $"Limit must be between 1 and {RequestLimits.MaxCommentLimit}."));
                }

                if (!CommentCursor.IsValid(after))
                {
                    return ApiResults.ValidationProblem(ValidationErrors.For(
                        "after",
                        "The comments cursor could not be understood."));
                }

                var effectiveLimit = Math.Clamp(limit ?? RequestLimits.DefaultCommentLimit, 1, RequestLimits.MaxCommentLimit);

                // The comments of an offer are the same for every caller, so the representation can
                // be shared. The paging position is part of the key.
                var cacheKey = $"conditional:comments:{offerId}:{effectiveLimit}:{after ?? "first"}";
                if (await conditional.TryNotModifiedAsync(cacheKey, httpContext, TimeSpan.FromSeconds(15), cancellationToken))
                {
                    return Results.Empty;
                }

                var page = await comments.GetForOfferAsync(offerId, effectiveLimit, after, cancellationToken);
                var response = new OfferCommentsResponseDto(page.Comments, page.HasMore, page.NextCursor);

                return conditional.Respond(response, cacheKey, httpContext, TimeSpan.FromSeconds(15));
            })
            .RequireAuthorization()
            .WithName("GetOfferComments")
            .WithSummary("OFFERS.COMMENTS.001 + OFFERS.COMMENTS.PAGINATION.001: List a page of the comments published for an offer.");

        group.MapPost("/{offerId}/comments", async (
                string offerId,
                CreateCommentRequest request,
                ICurrentUser currentUser,
                ICommentService comments,
                CancellationToken cancellationToken) =>
            {
                var profile = currentUser.Profile;
                if (profile is null)
                {
                    return Results.Unauthorized();
                }

                var outcome = await comments.AddAsync(offerId, profile.UserId, request, cancellationToken);
                if (!outcome.Result.Success)
                {
                    return outcome.Result.Message.StartsWith("Offer not found.", StringComparison.OrdinalIgnoreCase)
                        ? Results.NotFound(outcome.Result)
                        : Results.BadRequest(outcome.Result);
                }

                return Results.Ok(outcome.Comment);
            })
            .WithValidation<CreateCommentRequest>()
            .RequireAuthorization()
            .WithName("CreateOfferComment")
            .WithSummary("OFFERS.COMMENTS.001: Publish a plain-text comment for an offer.");

        return app;
    }
}
