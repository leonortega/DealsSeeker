using System.Collections.Concurrent;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Api.Services.Offers;

namespace DealsSeeker.Api.Services.Feedback;

public sealed class InMemoryFeedbackService(IOfferService offerService) : IFeedbackService
{
    private readonly ConcurrentBag<SuggestionRequest> _suggestions = [];
    private readonly ConcurrentBag<ReportRequest> _reports = [];

    public Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return Task.FromResult(new CommandResult(false, "Suggestion message is required."));
        }

        _suggestions.Add(request);
        return Task.FromResult(new CommandResult(true, "Suggestion submitted."));
    }

    public async Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return new CommandResult(false, "Report message is required.");
        }

        var normalizedRequest = request with
        {
            Message = request.Message.Trim(),
            OfferId = string.IsNullOrWhiteSpace(request.OfferId) ? null : request.OfferId.Trim(),
            UserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim()
        };

        if (!string.IsNullOrWhiteSpace(normalizedRequest.OfferId))
        {
            var result = await offerService.ReportAsync(
                normalizedRequest.OfferId,
                new ReportOfferRequest(normalizedRequest.Message),
                cancellationToken);

            if (!result.Success)
            {
                return result;
            }
        }

        _reports.Add(normalizedRequest);
        return new CommandResult(true, "Report submitted.");
    }
}
