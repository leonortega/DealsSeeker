namespace DealsSeeker.Shared.Contracts.Account;

public sealed record AuthSessionDto(
    string UserId,
    string DisplayName,
    string Email,
    string AccessToken);
