using DealsSeeker.Shared.Contracts.Account;
using MauiPreferences = Microsoft.Maui.Storage.Preferences;

namespace DealsSeeker.Mobile.Services.Auth;

public sealed class UserSessionService : IUserSessionService
{
    private const string TokenKey = "auth.token";
    private const string UserIdKey = "auth.userId";
    private const string DisplayNameKey = "auth.displayName";
    private const string EmailKey = "auth.email";

    public UserSessionService()
    {
        CurrentSession = LoadSession();
    }

    public AuthSessionDto? CurrentSession { get; private set; }

    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(CurrentSession?.AccessToken);

    public Task SetSessionAsync(AuthSessionDto session, CancellationToken cancellationToken)
    {
        CurrentSession = session;
        MauiPreferences.Set(TokenKey, session.AccessToken);
        MauiPreferences.Set(UserIdKey, session.UserId);
        MauiPreferences.Set(DisplayNameKey, session.DisplayName);
        MauiPreferences.Set(EmailKey, session.Email);
        return Task.CompletedTask;
    }

    public Task ClearSessionAsync(CancellationToken cancellationToken)
    {
        CurrentSession = null;
        MauiPreferences.Remove(TokenKey);
        MauiPreferences.Remove(UserIdKey);
        MauiPreferences.Remove(DisplayNameKey);
        MauiPreferences.Remove(EmailKey);
        return Task.CompletedTask;
    }

    private static AuthSessionDto? LoadSession()
    {
        var token = MauiPreferences.Get(TokenKey, string.Empty);
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        var userId = MauiPreferences.Get(UserIdKey, string.Empty);
        var displayName = MauiPreferences.Get(DisplayNameKey, string.Empty);
        var email = MauiPreferences.Get(EmailKey, string.Empty);
        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(displayName) ||
            string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        return new AuthSessionDto(userId, displayName, email, token);
    }
}
