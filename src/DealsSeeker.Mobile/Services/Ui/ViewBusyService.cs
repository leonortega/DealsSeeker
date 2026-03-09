namespace DealsSeeker.Mobile.Services.Ui;

public sealed class ViewBusyService : IViewBusyService
{
    private readonly object _gate = new();
    private int _busyCount;

    public bool IsBusy
    {
        get
        {
            lock (_gate)
            {
                return _busyCount > 0;
            }
        }
    }

    public event Action? Changed;

    public IDisposable Begin()
    {
        lock (_gate)
        {
            _busyCount++;
        }

        Changed?.Invoke();
        return new BusyScope(this);
    }

    private void End()
    {
        var changed = false;
        lock (_gate)
        {
            if (_busyCount > 0)
            {
                _busyCount--;
                changed = true;
            }
        }

        if (changed)
        {
            Changed?.Invoke();
        }
    }

    private sealed class BusyScope(ViewBusyService owner) : IDisposable
    {
        private int _disposed;

        public void Dispose()
        {
            if (Interlocked.Exchange(ref _disposed, 1) == 1)
            {
                return;
            }

            owner.End();
        }
    }
}
