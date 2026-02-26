namespace DealsSeeker.Shared.Contracts.Account;

public sealed record RegisterUserRequest(string DisplayName, string Email, string Password);
