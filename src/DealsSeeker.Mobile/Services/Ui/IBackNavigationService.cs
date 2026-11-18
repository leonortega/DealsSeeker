namespace DealsSeeker.Mobile.Services.Ui;

public interface IBackNavigationService
{
    void Register(Func<Task<bool>> handler);

    void Unregister(Func<Task<bool>> handler);

    Task<bool> TryGoBackAsync();
}
