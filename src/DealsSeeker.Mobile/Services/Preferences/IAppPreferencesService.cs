namespace DealsSeeker.Mobile.Services.Preferences;

public interface IAppPreferencesService
{
    string ThemeMode { get; }

    string Language { get; }

    string NavigationMode { get; }

    IReadOnlyList<string> SupportedLanguages { get; }

    event Action? Changed;

    Task InitializeAsync(string? userId, CancellationToken cancellationToken);

    Task SetThemeModeAsync(string mode, string? userId, CancellationToken cancellationToken);

    Task SetLanguageAsync(string language, string? userId, CancellationToken cancellationToken);

    Task SetNavigationModeAsync(string mode, string? userId, CancellationToken cancellationToken);

    string Translate(string key);
}
