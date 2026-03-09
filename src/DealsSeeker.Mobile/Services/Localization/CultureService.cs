using System.Globalization;
using MauiPreferences = Microsoft.Maui.Storage.Preferences;

namespace DealsSeeker.Mobile.Services.Localization;

public sealed class CultureService : ICultureService
{
    private const string GlobalLanguagePreferenceKey = "ui.language.global";
    private static readonly IReadOnlySet<string> SupportedLanguages = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "en",
        "es"
    };

    private CultureInfo _currentCulture = CultureInfo.CurrentUICulture;

    public CultureInfo CurrentCulture => _currentCulture;

    public event Action? CultureChanged;

    public CultureService()
    {
        var savedLanguage = MauiPreferences.Get(GlobalLanguagePreferenceKey, ResolveSystemLanguage());
        SetCultureInternal(savedLanguage, notify: false);
    }

    public static void ApplyStartupCultureFromPreferences()
    {
        var savedLanguage = MauiPreferences.Get(GlobalLanguagePreferenceKey, ResolveSystemLanguage());
        var normalizedLanguage = NormalizeLanguage(savedLanguage, ResolveSystemLanguage());
        ApplyCulture(new CultureInfo(normalizedLanguage));
    }

    public void SetCulture(string cultureName)
    {
        SetCultureInternal(cultureName, notify: true);
    }

    private void SetCultureInternal(string cultureName, bool notify)
    {
        var fallback = ResolveSystemLanguage();
        var normalizedLanguage = NormalizeLanguage(cultureName, fallback);
        var nextCulture = new CultureInfo(normalizedLanguage);

        var changed = !string.Equals(_currentCulture.Name, nextCulture.Name, StringComparison.OrdinalIgnoreCase);

        _currentCulture = nextCulture;
        MauiPreferences.Set(GlobalLanguagePreferenceKey, normalizedLanguage);
        ApplyCulture(nextCulture);

        if (notify && changed)
        {
            CultureChanged?.Invoke();
        }
    }

    private static void ApplyCulture(CultureInfo culture)
    {
        CultureInfo.CurrentCulture = culture;
        CultureInfo.CurrentUICulture = culture;
        CultureInfo.DefaultThreadCurrentCulture = culture;
        CultureInfo.DefaultThreadCurrentUICulture = culture;
    }

    private static string NormalizeLanguage(string? language, string fallback)
    {
        var normalized = (language ?? string.Empty).Trim().ToLowerInvariant();
        if (normalized.Contains('-', StringComparison.Ordinal))
        {
            normalized = normalized.Split('-', 2, StringSplitOptions.RemoveEmptyEntries)[0];
        }

        return SupportedLanguages.Contains(normalized) ? normalized : fallback;
    }

    private static string ResolveSystemLanguage()
    {
        var culture = CultureInfo.InstalledUICulture.TwoLetterISOLanguageName.ToLowerInvariant();
        return SupportedLanguages.Contains(culture) ? culture : "en";
    }
}
