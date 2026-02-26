using DealsSeeker.Shared.Contracts.Account;
using Microsoft.Maui.Storage;

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
        Preferences.Set(TokenKey, session.AccessToken);
        Preferences.Set(UserIdKey, session.UserId);
        Preferences.Set(DisplayNameKey, session.DisplayName);
        Preferences.Set(EmailKey, session.Email);
        return Task.CompletedTask;
    }

    public Task ClearSessionAsync(CancellationToken cancellationToken)
    {
        CurrentSession = null;
        Preferences.Remove(TokenKey);
        Preferences.Remove(UserIdKey);
        Preferences.Remove(DisplayNameKey);
        Preferences.Remove(EmailKey);
        return Task.CompletedTask;
    }

    private static AuthSessionDto? LoadSession()
    {
        var token = Preferences.Get(TokenKey, string.Empty);
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        var userId = Preferences.Get(UserIdKey, string.Empty);
        var displayName = Preferences.Get(DisplayNameKey, string.Empty);
        var email = Preferences.Get(EmailKey, string.Empty);
        if (string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(displayName) ||
            string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        return new AuthSessionDto(userId, displayName, email, token);
    }
}
