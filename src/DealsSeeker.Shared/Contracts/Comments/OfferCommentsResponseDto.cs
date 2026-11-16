namespace DealsSeeker.Shared.Contracts.Comments;

public sealed record OfferCommentsResponseDto(
    IReadOnlyList<OfferCommentDto> Comments,
    bool HasMore = false,
    string? NextCursor = null);
