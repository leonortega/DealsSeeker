using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Device;

public interface IMapLauncherService
{
    Task OpenDirectionsAsync(GeoPoint destination, string navigationMode, CancellationToken cancellationToken);
}
