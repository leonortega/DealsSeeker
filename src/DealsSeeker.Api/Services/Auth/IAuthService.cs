using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.Common;

namespace DealsSeeker.Api.Services.Auth;

public interface IAuthService
{
    Task<CommandResult> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken);

    Task<AuthSessionDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken);

    Task<UserProfileDto?> GetProfileByTokenAsync(string accessToken, CancellationToken cancellationToken);

    Task<CommandResult> LogoutAsync(string accessToken, CancellationToken cancellationToken);
}
