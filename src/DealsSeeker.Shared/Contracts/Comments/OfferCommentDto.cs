namespace DealsSeeker.Shared.Contracts.Comments;

/// <summary>
/// A plain-text comment published by a user on an offer.
/// </summary>
public sealed record OfferCommentDto(
    string CommentId,
    string OfferId,
    string UserId,
    string DisplayName,
    string AvatarId,
    string Body,
    string CreatedAtUtc);
