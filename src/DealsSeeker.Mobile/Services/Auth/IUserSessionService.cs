using DealsSeeker.Shared.Contracts.Account;

namespace DealsSeeker.Mobile.Services.Auth;

public interface IUserSessionService
{
    AuthSessionDto? CurrentSession { get; }

    bool IsAuthenticated { get; }

    Task SetSessionAsync(AuthSessionDto session, CancellationToken cancellationToken);

    Task ClearSessionAsync(CancellationToken cancellationToken);
}
