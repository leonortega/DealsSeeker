namespace DealsSeeker.Shared.Contracts.Account;

public sealed record UserProfileDto(
    string UserId,
    string DisplayName,
    string Email);
