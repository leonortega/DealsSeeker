using DealsSeeker.Shared.Contracts.AddOffer;

namespace DealsSeeker.Api.Services.Locations;

public interface ILocationLookupProvider
{
    string ProviderKey { get; }

    Task<IReadOnlyList<LocationSearchResultDto>> SearchAsync(string query, CancellationToken cancellationToken);
}
