namespace DealsSeeker.Mobile.Services.Ui;

public interface IViewBusyService
{
    bool IsBusy { get; }

    event Action? Changed;

    IDisposable Begin();
}
