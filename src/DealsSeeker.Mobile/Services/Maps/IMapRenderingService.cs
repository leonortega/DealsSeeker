using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Maps;

public interface IMapRenderingService
{
    string ActiveProvider { get; }

    string BuildMapEmbedUrl(GeoPoint center, IReadOnlyList<BusinessMarkerDto> markers, int zoom);

    string BuildLocationPreviewMapUrl(GeoPoint location, string? label, int zoom);
}
