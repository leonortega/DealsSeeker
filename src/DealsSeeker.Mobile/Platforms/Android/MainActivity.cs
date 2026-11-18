using Android.App;
using Android.Content.PM;
using Android.OS;
using Android.Views;
using Android.Window;
using DealsSeeker.Mobile.Services.Ui;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace DealsSeeker.Mobile;

[Activity(Theme = "@style/Maui.SplashTheme", MainLauncher = true, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize | ConfigChanges.Density)]
public class MainActivity : MauiAppCompatActivity
{
    private AppBackPressedCallback? _backPressedCallback;
    private AppBackInvokedCallback? _backInvokedCallback;

    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        // Android 13+ may deliver back through OnBackInvokedDispatcher (predictive back) instead of a
        // key event. Registering after base.OnCreate wins over MAUI's own callback for the same priority.
        if (OperatingSystem.IsAndroidVersionAtLeast(33))
        {
            _backInvokedCallback = new AppBackInvokedCallback(this);
            OnBackInvokedDispatcher?.RegisterOnBackInvokedCallback(0, _backInvokedCallback);
        }

        // Whichever route Android takes (key event, predictive back, or the AndroidX dispatcher),
        // back ends up in exactly one of these callbacks.
        _backPressedCallback = new AppBackPressedCallback(this);
        OnBackPressedDispatcher.AddCallback(this, _backPressedCallback);

        Log.Information("Android back handling registered (predictive back: {PredictiveBack}).", _backInvokedCallback is not null);
    }

    public override bool DispatchKeyEvent(KeyEvent? e)
    {
        // The WebView consumes KEYCODE_BACK to walk its own history, which bypasses the app's
        // navigation stack. Handle the press here so the app is the single authority on back.
        if (e is not null &&
            e.Action == KeyEventActions.Down &&
            e.KeyCode == Keycode.Back &&
            e.RepeatCount == 0)
        {
            Log.Information("Android back pressed (key event).");
            _ = HandleBackAsync();
            return true;
        }

        return base.DispatchKeyEvent(e);
    }

    protected override void OnDestroy()
    {
        if (OperatingSystem.IsAndroidVersionAtLeast(33) && _backInvokedCallback is not null)
        {
            OnBackInvokedDispatcher?.UnregisterOnBackInvokedCallback(_backInvokedCallback);
        }

        _backInvokedCallback?.Dispose();
        _backInvokedCallback = null;

        _backPressedCallback?.Dispose();
        _backPressedCallback = null;

        base.OnDestroy();
    }

    internal async Task HandleBackAsync()
    {
        var backNavigation = IPlatformApplication.Current?.Services?.GetService<IBackNavigationService>();
        Log.Information("Android back pressed. BackNavigationServiceResolved={Resolved}", backNavigation is not null);

        var handled = false;
        try
        {
            handled = backNavigation is not null && await backNavigation.TryGoBackAsync();
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Android back navigation failed.");
            handled = false;
        }

        Log.Information("Android back handled={Handled}", handled);
        if (!handled)
        {
            MoveTaskToBack(true);
        }
    }

    private sealed class AppBackPressedCallback(MainActivity activity)
        : AndroidX.Activity.OnBackPressedCallback(true)
    {
        public override void HandleOnBackPressed()
        {
            Log.Information("Android back pressed (OnBackPressedCallback).");
            _ = activity.HandleBackAsync();
        }
    }

    private sealed class AppBackInvokedCallback(MainActivity activity)
        : Java.Lang.Object, IOnBackInvokedCallback
    {
        public void OnBackInvoked()
        {
            Log.Information("Android back pressed (predictive back).");
            _ = activity.HandleBackAsync();
        }
    }
}
