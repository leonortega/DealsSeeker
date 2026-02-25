using DealsSeeker.Api.Options;
using DealsSeeker.Api.Services.Feedback;
using DealsSeeker.Api.Services.Locations;
using DealsSeeker.Api.Services.Offers;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<GoogleMapsOptions>(builder.Configuration.GetSection(GoogleMapsOptions.SectionName));

builder.Services.AddSingleton<IOfferService, InMemoryOfferService>();
builder.Services.AddSingleton<IFeedbackService, InMemoryFeedbackService>();
builder.Services.AddHttpClient<ILocationLookupService, GoogleMapsLocationLookupService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var api = app.MapGroup("/api");

api.MapPost("/offers/search", async (SearchOffersRequest request, IOfferService offers, CancellationToken cancellationToken) =>
    {
        var response = await offers.SearchAsync(request, cancellationToken);
        return Results.Ok(response);
    })
    .WithName("SearchOffers")
    .WithSummary("OFFERS.SEARCH.001: Search offers by tags and update map markers.");

api.MapPost("/offers/{offerId}/availability", async (string offerId, OfferAvailabilityVoteRequest request, IOfferService offers, CancellationToken cancellationToken) =>
    {
        var result = await offers.VoteAvailabilityAsync(offerId, request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("VoteOfferAvailability")
    .WithSummary("OFFERS.LIST.ACTIONS.001: Register thumbs up/down availability feedback counters.");

api.MapPost("/offers/{offerId}/report", async (string offerId, ReportOfferRequest request, IOfferService offers, CancellationToken cancellationToken) =>
    {
        var result = await offers.ReportAsync(offerId, request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.NotFound(result);
    })
    .WithName("ReportOffer")
    .WithSummary("OFFERS.LIST.ACTIONS.001: Report an offer.");

api.MapPost("/offers", async (AddOfferRequest request, IOfferService offers, CancellationToken cancellationToken) =>
    {
        var result = await offers.AddAsync(request, cancellationToken);
        return Results.Created($"/api/offers/{result.OfferId}", result);
    })
    .WithName("CreateOffer")
    .WithSummary("ADD.OFFER.*: Create a new offer from add-offer view inputs.");

api.MapGet("/locations/search", async (string query, ILocationLookupService lookup, CancellationToken cancellationToken) =>
    {
        var results = await lookup.SearchAsync(query, cancellationToken);
        return Results.Ok(results);
    })
    .WithName("SearchLocations")
    .WithSummary("ADD.OFFER.LOCATION.001: Search business or address using Google Maps API.");

api.MapPost("/suggestions", async (SuggestionRequest request, IFeedbackService feedback, CancellationToken cancellationToken) =>
    {
        var result = await feedback.SubmitSuggestionAsync(request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreateSuggestion")
    .WithSummary("App shell section: submit suggestion.");

api.MapPost("/reports", async (ReportRequest request, IFeedbackService feedback, CancellationToken cancellationToken) =>
    {
        var result = await feedback.SubmitReportAsync(request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreateReport")
    .WithSummary("App shell section: submit report.");

api.MapPost("/complaints", async (ReportRequest request, IFeedbackService feedback, CancellationToken cancellationToken) =>
    {
        var result = await feedback.SubmitReportAsync(request, cancellationToken);
        return result.Success ? Results.Ok(result) : Results.BadRequest(result);
    })
    .WithName("CreateComplaintAlias")
    .WithSummary("Backward-compatible alias for report submission.");

app.Run();
