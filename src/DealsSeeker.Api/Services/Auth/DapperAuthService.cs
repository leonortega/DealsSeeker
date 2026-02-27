using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Dapper;
using DealsSeeker.Api.Options;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.Common;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

namespace DealsSeeker.Api.Services.Auth;

public sealed class DapperAuthService(
    IDbConnectionFactory connectionFactory,
    IOptions<AuthOptions> authOptions,
    ILogger<DapperAuthService> logger) : IAuthService
{
    private readonly AuthOptions _authOptions = authOptions.Value;

    public async Task<CommandResult> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var displayName = request.DisplayName?.Trim() ?? string.Empty;
        var password = request.Password ?? string.Empty;

        if (string.IsNullOrWhiteSpace(displayName))
        {
            return new CommandResult(false, "Display name is required.");
        }

        if (!IsValidEmail(email))
        {
            return new CommandResult(false, "A valid email is required.");
        }

        if (!IsStrongPassword(password))
        {
            return new CommandResult(false, "Password must include at least 8 characters, letters, and numbers.");
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        try
        {
            var userId = $"usr-{Guid.NewGuid():N}"[..12];
            await connection.ExecuteAsync(
                """
                INSERT INTO users (user_id, display_name, email, password_hash, is_disabled, created_at_utc)
                VALUES (@UserId, @DisplayName, @Email, @PasswordHash, 0, @CreatedAtUtc);
                """,
                new
                {
                    UserId = userId,
                    DisplayName = displayName,
                    Email = email,
                    PasswordHash = HashPassword(password),
                    CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                });
        }
        catch (SqliteException ex) when (IsEmailUniqueConstraint(ex))
        {
            return new CommandResult(false, "An account with this email already exists.");
        }
        catch (SqliteException ex) when (ex.SqliteErrorCode == 19)
        {
            logger.LogWarning(ex,
                "Registration failed due to sqlite constraint that is not users.email uniqueness. Email={Email}",
                email);
            return new CommandResult(false, "Account could not be created due to a data constraint.");
        }

        return new CommandResult(true, "Account created.");
    }

    public async Task<AuthSessionDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var password = request.Password ?? string.Empty;
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return null;
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var user = await connection.QuerySingleOrDefaultAsync<UserRow>(
            """
            SELECT user_id AS UserId, display_name AS DisplayName, email AS Email, password_hash AS PasswordHash, is_disabled AS IsDisabled
            FROM users
            WHERE email = @Email
            LIMIT 1;
            """,
            new { Email = email });

        if (user is null || user.IsDisabled != 0 || !PasswordMatches(password, user.PasswordHash))
        {
            return null;
        }

        var accessToken = $"tok-{Guid.NewGuid():N}";
        var createdAt = DateTimeOffset.UtcNow;
        var expiresAt = createdAt.AddHours(Math.Clamp(_authOptions.SessionTtlHours, 1, 24 * 365));

        await connection.ExecuteAsync(
            """
            INSERT INTO auth_sessions (access_token, user_id, created_at_utc, expires_at_utc, revoked_at_utc)
            VALUES (@AccessToken, @UserId, @CreatedAtUtc, @ExpiresAtUtc, NULL);
            """,
            new
            {
                AccessToken = accessToken,
                UserId = user.UserId,
                CreatedAtUtc = createdAt.ToString("O"),
                ExpiresAtUtc = expiresAt.ToString("O")
            });

        return new AuthSessionDto(user.UserId, user.DisplayName, user.Email, accessToken);
    }

    public async Task<UserProfileDto?> GetProfileByTokenAsync(string accessToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return null;
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var row = await connection.QuerySingleOrDefaultAsync<ProfileRow>(
            """
            SELECT
                u.user_id AS UserId,
                u.display_name AS DisplayName,
                u.email AS Email,
                s.expires_at_utc AS ExpiresAtUtc,
                s.revoked_at_utc AS RevokedAtUtc,
                u.is_disabled AS IsDisabled
            FROM auth_sessions s
            INNER JOIN users u ON u.user_id = s.user_id
            WHERE s.access_token = @AccessToken
            LIMIT 1;
            """,
            new { AccessToken = accessToken });

        if (row is null)
        {
            return null;
        }

        if (row.IsDisabled != 0 || !string.IsNullOrWhiteSpace(row.RevokedAtUtc))
        {
            return null;
        }

        if (!DateTimeOffset.TryParse(row.ExpiresAtUtc, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var expiresAt) ||
            expiresAt <= DateTimeOffset.UtcNow)
        {
            await connection.ExecuteAsync(
                "UPDATE auth_sessions SET revoked_at_utc = @RevokedAtUtc WHERE access_token = @AccessToken AND revoked_at_utc IS NULL;",
                new { AccessToken = accessToken, RevokedAtUtc = DateTimeOffset.UtcNow.ToString("O") });
            return null;
        }

        return new UserProfileDto(row.UserId, row.DisplayName, row.Email);
    }

    public async Task<CommandResult> LogoutAsync(string accessToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return new CommandResult(false, "Session token is required.");
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var affectedRows = await connection.ExecuteAsync(
            """
            UPDATE auth_sessions
            SET revoked_at_utc = @RevokedAtUtc
            WHERE access_token = @AccessToken
              AND revoked_at_utc IS NULL;
            """,
            new { AccessToken = accessToken, RevokedAtUtc = DateTimeOffset.UtcNow.ToString("O") });

        return affectedRows > 0
            ? new CommandResult(true, "Session ended.")
            : new CommandResult(false, "Session not found.");
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

    private static bool IsEmailUniqueConstraint(SqliteException ex)
    {
        // SQLite unique/email collision usually contains these fragments.
        var message = ex.Message ?? string.Empty;
        return message.Contains("UNIQUE constraint failed: users.email", StringComparison.OrdinalIgnoreCase) ||
               message.Contains("users.email", StringComparison.OrdinalIgnoreCase);
    }

    private sealed record UserRow(
        string UserId,
        string DisplayName,
        string Email,
        string PasswordHash,
        long IsDisabled);

    private sealed record ProfileRow(
        string UserId,
        string DisplayName,
        string Email,
        string ExpiresAtUtc,
        string? RevokedAtUtc,
        long IsDisabled);
}
