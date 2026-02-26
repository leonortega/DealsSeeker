namespace DealsSeeker.Shared.Contracts.Feedback;

public sealed record ReportRequest(
    string Message,
    string? OfferId,
    string? UserId = null,
    DateTimeOffset? ReportedAtUtc = null);
