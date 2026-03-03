using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Api.Services.Locations;

public interface ILocationLookupProvider
{
    string ProviderKey { get; }

    Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken);

    Task<LocationSearchResultDto?> ReverseAsync(GeoPoint point, CancellationToken cancellationToken);
}
