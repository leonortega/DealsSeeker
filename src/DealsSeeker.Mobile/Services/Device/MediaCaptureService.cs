using DealsSeeker.Shared.Contracts.AddOffer;
using Microsoft.Extensions.Localization;

namespace DealsSeeker.Mobile.Services.Device;

public sealed class MediaCaptureService(IStringLocalizer<AppStrings> localizer) : IMediaCaptureService
{
    public async Task<PickedImage?> CapturePhotoAsync(CancellationToken cancellationToken)
    {
        var permission = await Permissions.RequestAsync<Permissions.Camera>();
        if (permission != PermissionStatus.Granted || !MediaPicker.Default.IsCaptureSupported)
        {
            return null;
        }

        var file = await MediaPicker.Default.CapturePhotoAsync();
        return file is null ? null : await ToPickedImageAsync(file, "camera", 0, cancellationToken);
    }

    public async Task<IReadOnlyList<PickedImage>> PickPhotosAsync(CancellationToken cancellationToken)
    {
        var files = await MediaPicker.Default.PickPhotosAsync(new MediaPickerOptions
        {
            Title = Translate("media.selectImages", "Select images")
        });

        var images = new List<PickedImage>();
        var order = 0;
        foreach (var file in files)
        {
            var picked = await ToPickedImageAsync(file, "gallery", order, cancellationToken);
            if (picked is not null)
            {
                images.Add(picked);
                order++;
            }
        }

        return images;
    }

    public async Task<PickedImage?> PickPhotoAsync(CancellationToken cancellationToken)
    {
        var photos = await PickPhotosAsync(cancellationToken);
        return photos.FirstOrDefault();
    }

    private static async Task<PickedImage?> ToPickedImageAsync(FileResult file, string source, int order, CancellationToken cancellationToken)
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
            order,
            file.FileName,
            dataUrl);

        return new PickedImage(dataUrl, metadata);
    }

    private string Translate(string key, string fallback)
    {
        var value = localizer[key];
        return value.ResourceNotFound ? fallback : value.Value;
    }
}
