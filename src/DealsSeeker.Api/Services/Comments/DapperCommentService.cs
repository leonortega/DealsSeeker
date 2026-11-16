using System.Text;
using Dapper;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Avatars;
using DealsSeeker.Shared.Contracts.Comments;

namespace DealsSeeker.Api.Services.Comments;

public sealed class DapperCommentService(IDbConnectionFactory connectionFactory) : ICommentService
{
    public async Task<OfferCommentsPage> GetForOfferAsync(
        string offerId,
        int limit,
        string? cursor,
        CancellationToken cancellationToken)
    {
        var effectiveLimit = Math.Clamp(limit, 1, RequestLimits.MaxCommentLimit);
        var hasValidCursor = TryDecodeCursor(cursor, out var position);
        if (!hasValidCursor)
        {
            throw new ArgumentException("The comments cursor could not be understood.", nameof(cursor));
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;

        var rows = (await connection.QueryAsync<CommentRow>(
            """
            SELECT
                c.comment_id AS CommentId,
                c.offer_id AS OfferId,
                c.user_id AS UserId,
                u.display_name AS DisplayName,
                u.avatar_id AS AvatarId,
                c.body AS Body,
                c.created_at_utc AS CreatedAtUtc
            FROM offer_comments c
            INNER JOIN users u ON u.user_id = c.user_id
            WHERE c.offer_id = @OfferId
              AND (
                    @CursorCreatedAtUtc IS NULL
                    OR (c.created_at_utc, c.comment_id) > (@CursorCreatedAtUtc, @CursorCommentId)
                  )
            ORDER BY c.created_at_utc ASC, c.comment_id ASC
            LIMIT @Limit;
            """,
            new
            {
                OfferId = offerId,
                CursorCreatedAtUtc = position?.CreatedAtUtc,
                CursorCommentId = position?.CommentId,
                Limit = effectiveLimit + 1
            })).AsList();

        var hasMore = rows.Count > effectiveLimit;
        if (hasMore)
        {
            rows.RemoveAt(rows.Count - 1);
        }

        var comments = rows.Select(Map).ToList();
        var nextCursor = hasMore && rows.Count > 0
            ? CommentCursor.Encode(rows[^1].CreatedAtUtc, rows[^1].CommentId)
            : null;

        return new OfferCommentsPage(comments, hasMore, nextCursor);
    }

    public async Task<AddCommentOutcome> AddAsync(
        string offerId,
        string userId,
        CreateCommentRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return AddCommentOutcome.Failure("Authenticated user is required.");
        }

        var body = request.Body?.Trim() ?? string.Empty;
        if (body.Length == 0)
        {
            return AddCommentOutcome.Failure("Comment body is required.");
        }

        if (body.Length > RequestLimits.MaxCommentBodyLength)
        {
            return AddCommentOutcome.Failure(
                $"Comment body must be at most {RequestLimits.MaxCommentBodyLength} characters.");
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;

        var commentId = $"cmt-{Guid.NewGuid():N}"[..12];
        var createdAtUtc = Timestamp.NowUtc();

        // The offer existence check is folded into the insert, so publishing a comment costs one statement.
        var inserted = await connection.ExecuteAsync(
            """
            INSERT INTO offer_comments (comment_id, offer_id, user_id, body, created_at_utc)
            SELECT @CommentId, @OfferId, @UserId, @Body, @CreatedAtUtc
            WHERE EXISTS (SELECT 1 FROM offers WHERE offer_id = @OfferId);
            """,
            new
            {
                CommentId = commentId,
                OfferId = offerId,
                UserId = userId,
                Body = body,
                CreatedAtUtc = createdAtUtc
            });

        if (inserted == 0)
        {
            return AddCommentOutcome.Failure("Offer not found.");
        }

        var author = await connection.QuerySingleOrDefaultAsync<AuthorRow>(
            """
            SELECT display_name AS DisplayName, avatar_id AS AvatarId
            FROM users
            WHERE user_id = @UserId
            LIMIT 1;
            """,
            new { UserId = userId });

        var comment = new OfferCommentDto(
            commentId,
            offerId,
            userId,
            author?.DisplayName ?? userId,
            AvatarCatalog.Normalize(author?.AvatarId),
            body,
            createdAtUtc);

        return AddCommentOutcome.Success(comment);
    }

    private static OfferCommentDto Map(CommentRow row) => new(
        row.CommentId,
        row.OfferId,
        row.UserId,
        row.DisplayName,
        AvatarCatalog.Normalize(row.AvatarId),
        row.Body,
        row.CreatedAtUtc);

    /// <summary>
    /// Decodes a cursor. An unrecognisable cursor is rejected rather than silently ignored.
    /// </summary>
    /// <returns>True when the cursor is valid (or absent); false when it cannot be understood.</returns>
    internal static bool TryDecodeCursor(string? cursor, out CursorPosition? position)
    {
        position = null;

        if (string.IsNullOrWhiteSpace(cursor))
        {
            return true;
        }

        if (!CommentCursor.IsValid(cursor))
        {
            return false;
        }

        var payload = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
        var separator = payload.IndexOf('|', StringComparison.Ordinal);
        position = new CursorPosition(payload[..separator], payload[(separator + 1)..]);
        return true;
    }

    internal sealed record CursorPosition(string CreatedAtUtc, string CommentId);

    private sealed record CommentRow(
        string CommentId,
        string OfferId,
        string UserId,
        string DisplayName,
        string? AvatarId,
        string Body,
        string CreatedAtUtc);

    private sealed record AuthorRow(string DisplayName, string? AvatarId);
}
