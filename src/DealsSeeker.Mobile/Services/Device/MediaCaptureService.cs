using DealsSeeker.Shared.Contracts.AddOffer;

namespace DealsSeeker.Mobile.Services.Device;

public sealed class MediaCaptureService : IMediaCaptureService
{
    public async Task<PickedImage?> CapturePhotoAsync(CancellationToken cancellationToken)
    {
        var permission = await Permissions.RequestAsync<Permissions.Camera>();
        if (permission != PermissionStatus.Granted || !MediaPicker.Default.IsCaptureSupported)
        {
            return null;
        }

        var file = await MediaPicker.Default.CapturePhotoAsync();
        return file is null ? null : await ToPickedImageAsync(file, "camera", cancellationToken);
    }

    public async Task<PickedImage?> PickPhotoAsync(CancellationToken cancellationToken)
    {
        var files = await MediaPicker.Default.PickPhotosAsync(new MediaPickerOptions
        {
            Title = "Select image"
        });
        var file = files.FirstOrDefault();
        return file is null ? null : await ToPickedImageAsync(file, "gallery", cancellationToken);
    }

    private static async Task<PickedImage?> ToPickedImageAsync(FileResult file, string source, CancellationToken cancellationToken)
    {
        await using var stream = await file.OpenReadAsync();
        using var memory = new MemoryStream();
        await stream.CopyToAsync(memory, cancellationToken);

        var bytes = memory.ToArray();
        if (bytes.Length == 0)
        {
            return null;
        }

        var mimeType = file.ContentType;
        if (string.IsNullOrWhiteSpace(mimeType))
        {
            mimeType = "image/jpeg";
        }

        var dataUrl = $"data:{mimeType};base64,{Convert.ToBase64String(bytes)}";
        var metadata = new OfferImageDto(
            source,
            mimeType,
            bytes.Length,
            null,
            null,
            file.FileName,
            dataUrl);

        return new PickedImage(dataUrl, metadata);
    }
}
