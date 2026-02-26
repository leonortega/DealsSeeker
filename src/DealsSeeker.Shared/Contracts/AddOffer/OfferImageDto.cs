namespace DealsSeeker.Shared.Contracts.AddOffer;

public sealed record OfferImageDto(
    string Source,
    string MimeType,
    long SizeBytes,
    int? Width,
    int? Height,
    string? FileName,
    string? DataUrl);
