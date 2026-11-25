namespace DealsSeeker.Api.Options;

public sealed class PhotonOptions
{
    public const string SectionName = "Photon";

    public string BaseUrl { get; init; } = "https://photon.komoot.io/api";

    public string UserAgent { get; init; } = "DealsSeeker/1.0";

    public int MaxResults { get; init; } = 8;
}
