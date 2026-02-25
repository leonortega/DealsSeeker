using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Device;

public interface IDeviceLocationService
{
    Task<GeoPoint?> TryGetCurrentLocationAsync(CancellationToken cancellationToken);
}

