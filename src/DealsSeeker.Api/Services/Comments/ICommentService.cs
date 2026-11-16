using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Comments;

namespace DealsSeeker.Api.Services.Comments;

/// <summary>
/// A page of comments, with the cursor that continues it.
/// </summary>
public sealed record OfferCommentsPage(
    IReadOnlyList<OfferCommentDto> Comments,
    bool HasMore,
    string? NextCursor);

public interface ICommentService
{
    /// <summary>
    /// Returns a page of the comments published for an offer, ordered from oldest to newest.
    /// </summary>
    /// <param name="cursor">An opaque cursor returned by a previous call, or null to start at the beginning.</param>
    Task<OfferCommentsPage> GetForOfferAsync(
        string offerId,
        int limit,
        string? cursor,
        CancellationToken cancellationToken);

    Task<AddCommentOutcome> AddAsync(string offerId, string userId, CreateCommentRequest request, CancellationToken cancellationToken);
}

/// <summary>
/// The outcome of publishing a comment.
/// </summary>
public sealed record AddCommentOutcome(CommandResult Result, OfferCommentDto? Comment)
{
    public static AddCommentOutcome Success(OfferCommentDto comment) =>
        new(new CommandResult(true, "Comment published."), comment);

    public static AddCommentOutcome Failure(string message) =>
        new(new CommandResult(false, message), null);
}
