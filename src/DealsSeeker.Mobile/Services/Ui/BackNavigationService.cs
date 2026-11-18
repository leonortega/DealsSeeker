namespace DealsSeeker.Mobile.Services.Ui;

public sealed class BackNavigationService : IBackNavigationService
{
    private readonly object _gate = new();
    private Func<Task<bool>>? _handler;

    public void Register(Func<Task<bool>> handler)
    {
        lock (_gate)
        {
            _handler = handler;
        }
    }

    public void Unregister(Func<Task<bool>> handler)
    {
        lock (_gate)
        {
            if (ReferenceEquals(_handler, handler))
            {
                _handler = null;
            }
        }
    }

    public Task<bool> TryGoBackAsync()
    {
        Func<Task<bool>>? handler;
        lock (_gate)
        {
            handler = _handler;
        }

        return handler is null ? Task.FromResult(false) : handler();
    }
}
