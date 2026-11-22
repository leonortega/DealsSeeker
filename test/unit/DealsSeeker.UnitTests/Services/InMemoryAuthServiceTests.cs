using DealsSeeker.Api.Services.Auth;
using DealsSeeker.Shared.Avatars;
using DealsSeeker.Shared.Contracts.Account;
using Xunit;

namespace DealsSeeker.UnitTests.Services;

public class InMemoryAuthServiceTests
{
    private static RegisterUserRequest ValidRegistration(string email = "ada@example.com") =>
        new("Ada", email, "password1");

    [Theory]
    [InlineData(" ", "a@b.co", "password1", "Display name is required.")]
    [InlineData("Ada", "not-an-email", "password1", "A valid email is required.")]
    [InlineData("Ada", "a@b.co", "short", "Password must include at least 8 characters, letters, and numbers.")]
    [InlineData("Ada", "a@b.co", "12345678", "Password must include at least 8 characters, letters, and numbers.")]
    public async Task RegisterAsync_RejectsInvalidInput(string displayName, string email, string password, string message)
    {
        var service = new InMemoryAuthService();

        var result = await service.RegisterAsync(new RegisterUserRequest(displayName, email, password), TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Equal(message, result.Message);
    }

    [Fact]
    public async Task RegisterAsync_CreatesAccount_AndRejectsDuplicateEmailCaseInsensitively()
    {
        var service = new InMemoryAuthService();

        var created = await service.RegisterAsync(ValidRegistration(), TestContext.Current.CancellationToken);
        var duplicate = await service.RegisterAsync(ValidRegistration("ADA@EXAMPLE.COM"), TestContext.Current.CancellationToken);

        Assert.True(created.Success);
        Assert.Equal("Account created.", created.Message);
        Assert.False(duplicate.Success);
        Assert.Equal("An account with this email already exists.", duplicate.Message);
    }

    [Fact]
    public async Task LoginAsync_ReturnsSession_ForValidCredentials()
    {
        var service = new InMemoryAuthService();
        await service.RegisterAsync(ValidRegistration(), TestContext.Current.CancellationToken);

        var session = await service.LoginAsync(new LoginRequest("  ADA@example.com ", "password1"), TestContext.Current.CancellationToken);

        Assert.NotNull(session);
        Assert.StartsWith("usr-", session.UserId);
        Assert.StartsWith("tok-", session.AccessToken);
        Assert.Equal("Ada", session.DisplayName);
        Assert.Equal("ada@example.com", session.Email);
    }

    [Theory]
    [InlineData("", "password1")]
    [InlineData("a@b.co", "")]
    [InlineData("unknown@b.co", "password1")]
    [InlineData("a@b.co", "wrong-password")]
    public async Task LoginAsync_ReturnsNull_ForInvalidCredentials(string email, string password)
    {
        var service = new InMemoryAuthService();
        await service.RegisterAsync(ValidRegistration(), TestContext.Current.CancellationToken);

        Assert.Null(await service.LoginAsync(new LoginRequest(email, password), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task GetProfileByTokenAsync_ReturnsProfileWithNormalizedAvatar()
    {
        var service = new InMemoryAuthService();
        await service.RegisterAsync(ValidRegistration(), TestContext.Current.CancellationToken);
        var session = (await service.LoginAsync(new LoginRequest("ada@example.com", "password1"), TestContext.Current.CancellationToken))!;

        var profile = await service.GetProfileByTokenAsync(session.AccessToken, TestContext.Current.CancellationToken);
        var missing = await service.GetProfileByTokenAsync("unknown", TestContext.Current.CancellationToken);
        var blank = await service.GetProfileByTokenAsync("  ", TestContext.Current.CancellationToken);

        Assert.NotNull(profile);
        Assert.Equal(AvatarCatalog.DefaultAvatarId, profile.AvatarId);
        Assert.Equal(session.UserId, profile.UserId);
        Assert.Null(missing);
        Assert.Null(blank);
    }

    [Fact]
    public async Task UpdateAvatarAsync_ValidatesAndUpdates()
    {
        var service = new InMemoryAuthService();
        await service.RegisterAsync(ValidRegistration(), TestContext.Current.CancellationToken);
        var session = (await service.LoginAsync(new LoginRequest("ada@example.com", "password1"), TestContext.Current.CancellationToken))!;

        var unknown = await service.UpdateAvatarAsync(session.UserId, new SetAvatarRequest("nope"), TestContext.Current.CancellationToken);
        var noUser = await service.UpdateAvatarAsync("usr-nobody", new SetAvatarRequest("cat"), TestContext.Current.CancellationToken);
        var noCaller = await service.UpdateAvatarAsync(" ", new SetAvatarRequest("cat"), TestContext.Current.CancellationToken);
        var updated = await service.UpdateAvatarAsync(session.UserId, new SetAvatarRequest(" CAT "), TestContext.Current.CancellationToken);

        Assert.False(unknown.Success);
        Assert.Equal("Unknown avatar.", unknown.Message);
        Assert.False(noUser.Success);
        Assert.False(noCaller.Success);
        Assert.True(updated.Success);
        Assert.Equal("CAT", (await service.GetProfileByTokenAsync(session.AccessToken, TestContext.Current.CancellationToken))!.AvatarId);
    }

    [Fact]
    public async Task LogoutAsync_RemovesToken()
    {
        var service = new InMemoryAuthService();
        await service.RegisterAsync(ValidRegistration(), TestContext.Current.CancellationToken);
        var session = (await service.LoginAsync(new LoginRequest("ada@example.com", "password1"), TestContext.Current.CancellationToken))!;

        var blank = await service.LogoutAsync(" ", TestContext.Current.CancellationToken);
        var missing = await service.LogoutAsync("tok-missing", TestContext.Current.CancellationToken);
        var success = await service.LogoutAsync(session.AccessToken, TestContext.Current.CancellationToken);

        Assert.False(blank.Success);
        Assert.False(missing.Success);
        Assert.True(success.Success);
        Assert.Null(await service.GetProfileByTokenAsync(session.AccessToken, TestContext.Current.CancellationToken));
    }
}
