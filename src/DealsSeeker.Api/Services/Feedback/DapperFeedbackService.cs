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

        var message = request.Message.Trim();
        var offerId = string.IsNullOrWhiteSpace(request.OfferId) ? null : request.OfferId.Trim();
        var userId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim();
        var reportedAtUtc = request.ReportedAtUtc?.ToUniversalTime() ?? DateTimeOffset.UtcNow;
        var createdAtUtc = DateTimeOffset.UtcNow.ToString("O");

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = connection.BeginTransaction();

        try
        {
            await connection.ExecuteAsync(
                """
                INSERT INTO reports (message, offer_id, user_id, reported_at_utc, created_at_utc)
                VALUES (@Message, @OfferId, @UserId, @ReportedAtUtc, @CreatedAtUtc);
                """,
                new
                {
                    Message = message,
                    OfferId = offerId,
                    UserId = userId,
                    ReportedAtUtc = reportedAtUtc.ToString("O"),
                    CreatedAtUtc = createdAtUtc
                },
                transaction);

            if (!string.IsNullOrWhiteSpace(offerId))
            {
                var affectedRows = await connection.ExecuteAsync(
                    """
                    UPDATE offers
                    SET report_count = report_count + 1
                    WHERE offer_id = @OfferId;
                    """,
                    new { OfferId = offerId },
                    transaction);

                if (affectedRows == 0)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return new CommandResult(false, "Offer not found.");
                }

                await connection.ExecuteAsync(
                    """
                    INSERT INTO offer_reports (offer_id, reason, created_at_utc)
                    VALUES (@OfferId, @Reason, @CreatedAtUtc);
                    """,
                    new
                    {
                        OfferId = offerId,
                        Reason = message,
                        CreatedAtUtc = createdAtUtc
                    },
                    transaction);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return new CommandResult(true, "Report submitted.");
    }
}
