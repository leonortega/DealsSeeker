using System.Collections.Concurrent;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;

namespace DealsSeeker.Api.Services.Feedback;

public sealed class InMemoryFeedbackService : IFeedbackService
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

    public Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return Task.FromResult(new CommandResult(false, "Report message is required."));
        }

        _reports.Add(request);
        return Task.FromResult(new CommandResult(true, "Report submitted."));
    }
}
