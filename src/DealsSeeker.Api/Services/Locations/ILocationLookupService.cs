using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Api.Services.Locations;

public interface ILocationLookupService
{
    Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken);

    Task<LocationSearchResultDto?> ReverseAsync(GeoPoint point, CancellationToken cancellationToken);
}
