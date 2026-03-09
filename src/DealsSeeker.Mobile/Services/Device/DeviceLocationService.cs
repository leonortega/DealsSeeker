using DealsSeeker.Mobile.Services.Ui;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Device;

public sealed class DeviceLocationService(IViewBusyService busy) : IDeviceLocationService
{
    public async Task<GeoPoint?> TryGetCurrentLocationAsync(CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();

        try
        {
            var permission = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
            if (permission != PermissionStatus.Granted)
            {
                return null;
            }

            var request = new GeolocationRequest(GeolocationAccuracy.Medium, TimeSpan.FromSeconds(10));
            var location = await Geolocation.Default.GetLocationAsync(request, cancellationToken);
            if (location is null)
            {
                return null;
            }

            return new GeoPoint(location.Latitude, location.Longitude);
        }
        catch
        {
            return null;
        }
    }
}
