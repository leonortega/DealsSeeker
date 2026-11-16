using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Dapper;
using DealsSeeker.Api.Options;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Shared.Avatars;
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
    private const int PasswordIterations = 210_000;
    private const int PasswordSaltBytes = 16;
    private const int PasswordHashBytes = 32;
    private const string PasswordScheme = "pbkdf2-sha256";

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

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
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
                    CreatedAtUtc = Timestamp.NowUtc()
                });
        }
        catch (SqliteException ex) when (IsUniqueConstraint(ex))
        {
            return new CommandResult(false, "An account with this email already exists.");
        }
        catch (SqliteException ex) when (IsConstraintViolation(ex))
        {
            logger.LogWarning(ex,
                "Registration failed due to a database constraint that is not users.email uniqueness. Email={Email}",
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

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        var user = await connection.QuerySingleOrDefaultAsync<UserRow>(
            """
            SELECT user_id AS UserId, display_name AS DisplayName, email AS Email, password_hash AS PasswordHash, is_disabled AS IsDisabled
            FROM users
            WHERE email = @Email
            LIMIT 1;
            """,
            new { Email = email });

        if (user is null || user.IsDisabled != 0)
        {
            return null;
        }

        var verification = VerifyPassword(password, user.PasswordHash);
        if (!verification.Matches)
        {
            return null;
        }

        if (verification.NeedsRehash)
        {
            // Upgrade the stored hash to the current parameters on a successful sign-in.
            await connection.ExecuteAsync(
                "UPDATE users SET password_hash = @PasswordHash WHERE user_id = @UserId;",
                new { PasswordHash = HashPassword(password), UserId = user.UserId });
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

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        var row = await connection.QuerySingleOrDefaultAsync<ProfileRow>(
            """
            SELECT
                u.user_id AS UserId,
                u.display_name AS DisplayName,
                u.email AS Email,
                u.avatar_id AS AvatarId,
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

        if (!Timestamp.TryParse(row.ExpiresAtUtc, out var expiresAt) || expiresAt <= DateTimeOffset.UtcNow)
        {
            // Expired sessions are reclaimed by the background housekeeping sweep; this path stays read-only.
            return null;
        }

        return new UserProfileDto(row.UserId, row.DisplayName, row.Email, AvatarCatalog.Normalize(row.AvatarId));
    }

    public async Task<CommandResult> UpdateAvatarAsync(string userId, SetAvatarRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return new CommandResult(false, "Authenticated user is required.");
        }

        if (!AvatarCatalog.IsValid(request.AvatarId))
        {
            return new CommandResult(false, "Unknown avatar.");
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        var affectedRows = await connection.ExecuteAsync(
            """
            UPDATE users
            SET avatar_id = @AvatarId
            WHERE user_id = @UserId;
            """,
            new { AvatarId = request.AvatarId.Trim(), UserId = userId });

        return affectedRows > 0
            ? new CommandResult(true, "Avatar updated.")
            : new CommandResult(false, "User not found.");
    }

    public async Task<CommandResult> LogoutAsync(string accessToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return new CommandResult(false, "Session token is required.");
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        var affectedRows = await connection.ExecuteAsync(
            """
            UPDATE auth_sessions
            SET revoked_at_utc = @RevokedAtUtc
            WHERE access_token = @AccessToken
              AND revoked_at_utc IS NULL;
            """,
            new { AccessToken = accessToken, RevokedAtUtc = Timestamp.NowUtc() });

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

    /// <summary>
    /// Hashes a password with PBKDF2-HMAC-SHA256 and a per-user random salt.
    /// </summary>
    /// <remarks>
    /// The stored format is self-describing so that the work factor can be raised later without
    /// invalidating existing hashes: <c>$pbkdf2-sha256$i=&lt;iterations&gt;$&lt;salt&gt;$&lt;hash&gt;</c>.
    /// </remarks>
    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(PasswordSaltBytes);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            PasswordIterations,
            HashAlgorithmName.SHA256,
            PasswordHashBytes);

        return $"${PasswordScheme}$i={PasswordIterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    private static PasswordVerification VerifyPassword(string password, string storedHash)
    {
        if (string.IsNullOrWhiteSpace(storedHash))
        {
            return new PasswordVerification(false, false);
        }

        if (!storedHash.StartsWith('$'))
        {
            // Legacy unsalted SHA-256 hash: accepted so existing accounts can sign in once and are
            // then transparently upgraded to the current scheme.
            var legacy = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password)));
            var legacyMatches = CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(legacy),
                Encoding.UTF8.GetBytes(storedHash));
            return new PasswordVerification(legacyMatches, legacyMatches);
        }

        var parts = storedHash.Split('$', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 4 ||
            !parts[0].Equals(PasswordScheme, StringComparison.OrdinalIgnoreCase))
        {
            return new PasswordVerification(false, false);
        }

        var iterationText = parts[1];
        if (!iterationText.StartsWith("i=", StringComparison.OrdinalIgnoreCase) ||
            !int.TryParse(iterationText[2..], NumberStyles.Integer, CultureInfo.InvariantCulture, out var iterations) ||
            iterations <= 0)
        {
            return new PasswordVerification(false, false);
        }

        byte[] salt;
        byte[] expectedHash;
        try
        {
            salt = Convert.FromBase64String(parts[2]);
            expectedHash = Convert.FromBase64String(parts[3]);
        }
        catch (FormatException)
        {
            return new PasswordVerification(false, false);
        }

        if (salt.Length == 0 || expectedHash.Length == 0)
        {
            return new PasswordVerification(false, false);
        }

        var actualHash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations,
            HashAlgorithmName.SHA256,
            expectedHash.Length);

        var matches = CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        var needsRehash = matches && iterations < PasswordIterations;
        return new PasswordVerification(matches, needsRehash);
    }

    /// <summary>SQLite constraint violation, independent of the message text.</summary>
    private static bool IsConstraintViolation(SqliteException ex) =>
        ex.SqliteErrorCode == SqliteConstraintErrorCode;

    /// <summary>Unique or primary key constraint violation, independent of the message text.</summary>
    private static bool IsUniqueConstraint(SqliteException ex)
    {
        if (ex.SqliteErrorCode != SqliteConstraintErrorCode)
        {
            return false;
        }

        const int SqliteConstraintUnique = 2067;
        const int SqliteConstraintPrimaryKey = 1555;
        return ex.SqliteExtendedErrorCode is SqliteConstraintUnique or SqliteConstraintPrimaryKey;
    }

    private const int SqliteConstraintErrorCode = 19;

    private sealed record PasswordVerification(bool Matches, bool NeedsRehash);

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
        string? AvatarId,
        string ExpiresAtUtc,
        string? RevokedAtUtc,
        long IsDisabled);
}
