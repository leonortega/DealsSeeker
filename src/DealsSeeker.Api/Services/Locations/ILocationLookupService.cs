using DealsSeeker.Shared.Contracts.AddOffer;

namespace DealsSeeker.Api.Services.Locations;

public interface ILocationLookupService
{
    Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken);
}

