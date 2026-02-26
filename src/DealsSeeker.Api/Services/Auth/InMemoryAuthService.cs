using System.Collections.Concurrent;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.Common;

namespace DealsSeeker.Api.Services.Auth;

public sealed class InMemoryAuthService : IAuthService
{
    private readonly ConcurrentDictionary<string, UserRecord> _usersByEmail = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, string> _tokensToUserId = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _sync = new();

    public Task<CommandResult> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var displayName = request.DisplayName?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;

        if (string.IsNullOrWhiteSpace(displayName))
        {
            return Task.FromResult(new CommandResult(false, "Display name is required."));
        }

        if (!IsValidEmail(email))
        {
            return Task.FromResult(new CommandResult(false, "A valid email is required."));
        }

        if (!IsStrongPassword(password))
        {
            return Task.FromResult(new CommandResult(false, "Password must include at least 8 characters, letters, and numbers."));
        }

        lock (_sync)
        {
            if (_usersByEmail.ContainsKey(email))
            {
                return Task.FromResult(new CommandResult(false, "An account with this email already exists."));
            }

            var userId = $"usr-{Guid.NewGuid():N}"[..12];
            _usersByEmail[email] = new UserRecord(
                userId,
                displayName,
                email,
                HashPassword(password),
                false);
        }

        return Task.FromResult(new CommandResult(true, "Account created."));
    }

    public Task<AuthSessionDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var password = request.Password ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return Task.FromResult<AuthSessionDto?>(null);
        }

        if (!_usersByEmail.TryGetValue(email, out var user))
        {
            return Task.FromResult<AuthSessionDto?>(null);
        }

        if (user.IsDisabled || !PasswordMatches(password, user.PasswordHash))
        {
            return Task.FromResult<AuthSessionDto?>(null);
        }

        var accessToken = $"tok-{Guid.NewGuid():N}";
        _tokensToUserId[accessToken] = user.UserId;

        return Task.FromResult<AuthSessionDto?>(new AuthSessionDto(
            user.UserId,
            user.DisplayName,
            user.Email,
            accessToken));
    }

    public Task<UserProfileDto?> GetProfileByTokenAsync(string accessToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return Task.FromResult<UserProfileDto?>(null);
        }

        if (!_tokensToUserId.TryGetValue(accessToken, out var userId))
        {
            return Task.FromResult<UserProfileDto?>(null);
        }

        var user = _usersByEmail.Values.FirstOrDefault(u => string.Equals(u.UserId, userId, StringComparison.OrdinalIgnoreCase));
        if (user is null || user.IsDisabled)
        {
            return Task.FromResult<UserProfileDto?>(null);
        }

        return Task.FromResult<UserProfileDto?>(new UserProfileDto(user.UserId, user.DisplayName, user.Email));
    }

    public Task<CommandResult> LogoutAsync(string accessToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return Task.FromResult(new CommandResult(false, "Session token is required."));
        }

        var removed = _tokensToUserId.TryRemove(accessToken, out _);
        return Task.FromResult(removed
            ? new CommandResult(true, "Session ended.")
            : new CommandResult(false, "Session not found."));
    }

    private static bool IsStrongPassword(string password) =>
        password.Length >= 8 &&
        password.Any(char.IsLetter) &&
        password.Any(char.IsDigit);

    private static bool IsValidEmail(string email) =>
        !string.IsNullOrWhiteSpace(email) &&
        Regex.IsMatch(email, "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", RegexOptions.CultureInvariant);

    private static string NormalizeEmail(string email) =>
        (email ?? string.Empty).Trim().ToLower(CultureInfo.InvariantCulture);

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private static bool PasswordMatches(string password, string storedHash) =>
        string.Equals(HashPassword(password), storedHash, StringComparison.Ordinal);

    private sealed record UserRecord(
        string UserId,
        string DisplayName,
        string Email,
        string PasswordHash,
        bool IsDisabled);
}
