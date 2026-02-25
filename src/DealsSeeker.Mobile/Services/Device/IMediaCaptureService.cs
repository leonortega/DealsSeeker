namespace DealsSeeker.Mobile.Services.Device;

public interface IMediaCaptureService
{
    Task<PickedImage?> CapturePhotoAsync(CancellationToken cancellationToken);

    Task<PickedImage?> PickPhotoAsync(CancellationToken cancellationToken);
}

