using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;

namespace DealsSeeker.Api.Services.Feedback;

public interface IFeedbackService
{
    Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken);

    Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken);
}
