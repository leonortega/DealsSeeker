using DealsSeeker.Api.Responses;
using DealsSeeker.Api.Services.Locations;
using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Api.Endpoints;

public static class LocationEndpoints
{
    public static IEndpointRouteBuilder MapLocationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/locations");

        group.MapGet("/search", async (
                string? query,
                HttpContext httpContext,
                ConditionalResponseService conditional,
                ILocationLookupService lookup,
                CancellationToken cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return Results.Ok(Array.Empty<DealsSeeker.Shared.Contracts.AddOffer.LocationSearchResultDto>());
                }

                if (query.Length > RequestLimits.MaxLocationQueryLength)
                {
                    return ApiResults.ValidationProblem(ValidationErrors.For(
                        "query",
                        $"Query must be at most {RequestLimits.MaxLocationQueryLength} characters."));
                }

                var cacheKey = $"conditional:locations:search:{query.Trim().ToLowerInvariant()}";
                if (await conditional.TryNotModifiedAsync(cacheKey, httpContext, TimeSpan.FromMinutes(5), cancellationToken))
                {
                    return Results.Empty;
                }

                try
                {
                    var results = await lookup.SearchAsync(query, cancellationToken);
                    return conditional.Respond(results, cacheKey, httpContext, TimeSpan.FromMinutes(5));
                }
                catch (LocationProviderUnavailableException ex)
                {
                    return ApiResults.ProviderUnavailable(ex.Message);
                }
            })
            .RequireRateLimiting("location")
            .WithName("SearchLocations")
            .WithSummary("ADD.OFFER.LOCATION.001 + APP.CONFIG.MAPS.001: Search business or address using configured map provider module.");

        group.MapGet("/reverse", async (
                double lat,
                double lng,
                ILocationLookupService lookup,
                CancellationToken cancellationToken) =>
            {
                if (double.IsNaN(lat) || double.IsInfinity(lat) || lat is < -90 or > 90)
                {
                    return ApiResults.ValidationProblem(ValidationErrors.For("lat", "Latitude must be between -90 and 90."));
                }

                if (double.IsNaN(lng) || double.IsInfinity(lng) || lng is < -180 or > 180)
                {
                    return ApiResults.ValidationProblem(ValidationErrors.For("lng", "Longitude must be between -180 and 180."));
                }

                try
                {
                    var result = await lookup.ReverseAsync(new GeoPoint(lat, lng), cancellationToken);
                    return result is null ? Results.NotFound() : Results.Ok(result);
                }
                catch (LocationProviderUnavailableException ex)
                {
                    return ApiResults.ProviderUnavailable(ex.Message);
                }
            })
            .RequireRateLimiting("location")
            .WithName("ReverseLocation")
            .WithSummary("ADD.OFFER.LOCATION.001: Resolve nearest human-readable address label from coordinates.");

        return app;
    }
}
