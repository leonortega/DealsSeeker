using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Comments;

namespace DealsSeeker.Api.Services.Comments;

public interface ICommentService
{
    Task<IReadOnlyList<OfferCommentDto>> GetForOfferAsync(string offerId, CancellationToken cancellationToken);

    Task<AddCommentOutcome> AddAsync(string offerId, string userId, CreateCommentRequest request, CancellationToken cancellationToken);
}

public sealed record AddCommentOutcome(CommandResult Result, OfferCommentDto? Comment)
{
    public static AddCommentOutcome Failure(string message) => new(new CommandResult(false, message), null);

    public static AddCommentOutcome Success(OfferCommentDto comment) => new(new CommandResult(true, "Comment published."), comment);
}
