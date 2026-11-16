using DealsSeeker.Api.Services.Feedback;
using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Contracts.Feedback;

namespace DealsSeeker.Api.Endpoints;

public static class FeedbackEndpoints
{
    public static IEndpointRouteBuilder MapFeedbackEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/suggestions", async (
                SuggestionRequest request,
                IFeedbackService feedback,
                CancellationToken cancellationToken) =>
            {
                var result = await feedback.SubmitSuggestionAsync(request, cancellationToken);
                return result.Success ? Results.Ok(result) : Results.BadRequest(result);
            })
            .WithValidation<SuggestionRequest>()
            .WithName("CreateSuggestion")
            .WithSummary("SUGGESTIONS.SUBMIT.001: Submit a suggestion with required message and optional contact details.");

        app.MapPost("/reports", async (
                ReportRequest request,
                IFeedbackService feedback,
                CancellationToken cancellationToken) =>
            {
                var result = await feedback.SubmitReportAsync(request, cancellationToken);
                return result.Success ? Results.Ok(result) : Results.BadRequest(result);
            })
            .WithValidation<ReportRequest>()
            .WithName("CreateReport")
            .WithSummary("REPORTS.SUBMIT.001 + REPORTS.OFFER.PREFILL.001: Submit a generic or offer-prefilled report.");

        app.MapPost("/complaints", async (
                ReportRequest request,
                IFeedbackService feedback,
                CancellationToken cancellationToken) =>
            {
                var result = await feedback.SubmitReportAsync(request, cancellationToken);
                return result.Success ? Results.Ok(result) : Results.BadRequest(result);
            })
            .WithValidation<ReportRequest>()
            .WithName("CreateComplaintAlias")
            .WithSummary("REPORTS.SUBMIT.001: Backward-compatible alias for report submission.");

        return app;
    }
}
