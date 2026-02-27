using Dapper;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;

namespace DealsSeeker.Api.Services.Feedback;

public sealed class DapperFeedbackService(IDbConnectionFactory connectionFactory) : IFeedbackService
{
    public async Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return new CommandResult(false, "Suggestion message is required.");
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await connection.ExecuteAsync(
            """
            INSERT INTO suggestions (message, contact, created_at_utc)
            VALUES (@Message, @Contact, @CreatedAtUtc);
            """,
            new
            {
                Message = request.Message.Trim(),
                Contact = string.IsNullOrWhiteSpace(request.Contact) ? null : request.Contact.Trim(),
                CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
            });

        return new CommandResult(true, "Suggestion submitted.");
    }

    public async Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return new CommandResult(false, "Report message is required.");
        }

        var reportedAtUtc = request.ReportedAtUtc?.ToUniversalTime() ?? DateTimeOffset.UtcNow;

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await connection.ExecuteAsync(
            """
            INSERT INTO reports (message, offer_id, user_id, reported_at_utc, created_at_utc)
            VALUES (@Message, @OfferId, @UserId, @ReportedAtUtc, @CreatedAtUtc);
            """,
            new
            {
                Message = request.Message.Trim(),
                OfferId = string.IsNullOrWhiteSpace(request.OfferId) ? null : request.OfferId.Trim(),
                UserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim(),
                ReportedAtUtc = reportedAtUtc.ToString("O"),
                CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
            });

        return new CommandResult(true, "Report submitted.");
    }
}
