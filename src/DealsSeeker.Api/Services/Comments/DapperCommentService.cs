using Dapper;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Shared.Avatars;
using DealsSeeker.Shared.Contracts.Comments;

namespace DealsSeeker.Api.Services.Comments;

public sealed class DapperCommentService(IDbConnectionFactory connectionFactory) : ICommentService
{
    private const int MaxCommentLength = 2000;

    public async Task<IReadOnlyList<OfferCommentDto>> GetForOfferAsync(string offerId, CancellationToken cancellationToken)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var rows = await connection.QueryAsync<CommentRow>(
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
            ORDER BY c.created_at_utc ASC, c.comment_id ASC;
            """,
            new { OfferId = offerId });

        return rows.Select(Map).ToList();
    }

    public async Task<AddCommentOutcome> AddAsync(string offerId, string userId, CreateCommentRequest request, CancellationToken cancellationToken)
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

        if (body.Length > MaxCommentLength)
        {
            return AddCommentOutcome.Failure($"Comment body must be at most {MaxCommentLength} characters.");
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var offerExists = await connection.ExecuteScalarAsync<long>(
            "SELECT COUNT(1) FROM offers WHERE offer_id = @OfferId;",
            new { OfferId = offerId });
        if (offerExists == 0)
        {
            return AddCommentOutcome.Failure("Offer not found.");
        }

        var commentId = $"cmt-{Guid.NewGuid():N}"[..12];
        var createdAtUtc = DateTimeOffset.UtcNow.ToString("O");

        await connection.ExecuteAsync(
            """
            INSERT INTO offer_comments (comment_id, offer_id, user_id, body, created_at_utc)
            VALUES (@CommentId, @OfferId, @UserId, @Body, @CreatedAtUtc);
            """,
            new
            {
                CommentId = commentId,
                OfferId = offerId,
                UserId = userId,
                Body = body,
                CreatedAtUtc = createdAtUtc
            });

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
