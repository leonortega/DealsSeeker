namespace DealsSeeker.Shared.Contracts.Comments;

public sealed record OfferCommentsResponseDto(IReadOnlyList<OfferCommentDto> Comments);
