using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Device;

public interface IMapLauncherService
{
    Task OpenWalkingDirectionsAsync(GeoPoint destination, CancellationToken cancellationToken);
}

