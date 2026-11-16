namespace DealsSeeker.Api.Endpoints;

/// <summary>
/// The endpoint surface of the API, grouped by bounded context.
/// </summary>
public static class DealsSeekerApiEndpoints
{
    public static IEndpointRouteBuilder MapDealsSeekerApi(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api");

        api.MapAuthEndpoints();
        api.MapAccountEndpoints();
        api.MapOfferEndpoints();
        api.MapCommentEndpoints();
        api.MapLocationEndpoints();
        api.MapFeedbackEndpoints();

        return app;
    }
}
