using System.Globalization;

namespace DealsSeeker.Mobile.Services.Localization;

public interface ICultureService
{
    CultureInfo CurrentCulture { get; }

    event Action? CultureChanged;

    void SetCulture(string cultureName);
}
