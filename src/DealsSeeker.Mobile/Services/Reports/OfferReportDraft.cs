using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Reports;

public sealed record OfferReportDraft(
    OfferItemDto Offer,
    string UserId,
    DateTimeOffset ReportedAtUtc,
    string InitialMessage);
