using System.Globalization;
using DealsSeeker.Mobile.Services.Localization;
using Microsoft.Extensions.Localization;
using MauiPreferences = Microsoft.Maui.Storage.Preferences;

namespace DealsSeeker.Mobile.Services.Preferences;

public sealed class AppPreferencesService : IAppPreferencesService, IDisposable
{
    private const string ThemeKeyPrefix = "ui.theme.";
    private const string LanguageKeyPrefix = "ui.language.";
    private static readonly IReadOnlyList<string> Languages = ["en", "es"];

    private readonly ICultureService _cultureService;
    private readonly IStringLocalizer<AppStrings> _localizer;

    public string ThemeMode { get; private set; } = "system";

    public string Language => NormalizeLanguage(_cultureService.CurrentCulture.TwoLetterISOLanguageName, "en");

    public IReadOnlyList<string> SupportedLanguages => Languages;

    public event Action? Changed;

    public AppPreferencesService(ICultureService cultureService, IStringLocalizer<AppStrings> localizer)
    {
        _cultureService = cultureService;
        _localizer = localizer;
        _cultureService.CultureChanged += OnCultureChanged;
    }

    public Task InitializeAsync(string? userId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var nextTheme = NormalizeThemeMode(MauiPreferences.Get(ThemePreferenceKey(userId), "system"));
        var themeChanged = !string.Equals(ThemeMode, nextTheme, StringComparison.OrdinalIgnoreCase);
        ThemeMode = nextTheme;

        var defaultLanguage = ResolveSystemLanguage();
        var selectedLanguage = NormalizeLanguage(
            MauiPreferences.Get(LanguagePreferenceKey(userId), defaultLanguage),
            defaultLanguage);

        var languageChanged = !string.Equals(Language, selectedLanguage, StringComparison.OrdinalIgnoreCase);
        if (languageChanged)
        {
            _cultureService.SetCulture(selectedLanguage);
        }

        if (themeChanged || !languageChanged)
        {
            Changed?.Invoke();
        }

        return Task.CompletedTask;
    }

    public Task SetThemeModeAsync(string mode, string? userId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        ThemeMode = NormalizeThemeMode(mode);
        MauiPreferences.Set(ThemePreferenceKey(userId), ThemeMode);
        Changed?.Invoke();
        return Task.CompletedTask;
    }

    public Task SetLanguageAsync(string language, string? userId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var defaultLanguage = ResolveSystemLanguage();
        var selectedLanguage = NormalizeLanguage(language, defaultLanguage);

        MauiPreferences.Set(LanguagePreferenceKey(userId), selectedLanguage);
        var languageChanged = !string.Equals(Language, selectedLanguage, StringComparison.OrdinalIgnoreCase);
        if (languageChanged)
        {
            _cultureService.SetCulture(selectedLanguage);
        }
        else
        {
            Changed?.Invoke();
        }

        return Task.CompletedTask;
    }

    public string Translate(string key)
    {
        var culture = _cultureService.CurrentCulture;
        if (!string.Equals(CultureInfo.CurrentUICulture.Name, culture.Name, StringComparison.OrdinalIgnoreCase))
        {
            CultureInfo.CurrentCulture = culture;
            CultureInfo.CurrentUICulture = culture;
        }

        var value = _localizer[key];
        return value.ResourceNotFound ? key : value.Value;
    }

    public void Dispose()
    {
        _cultureService.CultureChanged -= OnCultureChanged;
    }

    private void OnCultureChanged()
    {
        Changed?.Invoke();
    }

    private static string ThemePreferenceKey(string? userId) =>
        string.IsNullOrWhiteSpace(userId) ? $"{ThemeKeyPrefix}global" : $"{ThemeKeyPrefix}{userId}";

    private static string LanguagePreferenceKey(string? userId) =>
        string.IsNullOrWhiteSpace(userId) ? $"{LanguageKeyPrefix}global" : $"{LanguageKeyPrefix}{userId}";

    private static string NormalizeThemeMode(string? mode)
    {
        var normalized = (mode ?? string.Empty).Trim().ToLowerInvariant();
        return normalized switch
        {
            "light" => "light",
            "dark" => "dark",
            _ => "system"
        };
    }

    private static string NormalizeLanguage(string? language, string fallback)
    {
        var normalized = (language ?? string.Empty).Trim().ToLowerInvariant();
        if (normalized.Contains('-', StringComparison.Ordinal))
        {
            normalized = normalized.Split('-', 2, StringSplitOptions.RemoveEmptyEntries)[0];
        }

        if (Languages.Contains(normalized, StringComparer.OrdinalIgnoreCase))
        {
            return normalized;
        }

        return fallback;
    }

    private static string ResolveSystemLanguage()
    {
        var culture = CultureInfo.InstalledUICulture.TwoLetterISOLanguageName.ToLowerInvariant();
        return Languages.Contains(culture, StringComparer.OrdinalIgnoreCase) ? culture : "en";
    }
}
