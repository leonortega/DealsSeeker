using Microsoft.AspNetCore.Components.WebView;
using Microsoft.AspNetCore.Components.WebView.Maui;
using Serilog;
#if WINDOWS
using Microsoft.UI.Xaml.Controls;
#endif

namespace DealsSeeker.Mobile;

public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();

        blazorWebView.BlazorWebViewInitializing += OnBlazorWebViewInitializing;
        blazorWebView.BlazorWebViewInitialized += OnBlazorWebViewInitialized;
        blazorWebView.UrlLoading += OnBlazorWebViewUrlLoading;
    }

    private static void OnBlazorWebViewInitializing(object? sender, BlazorWebViewInitializingEventArgs e)
    {
        Log.Information("BlazorWebView initializing.");
    }

    private static void OnBlazorWebViewInitialized(object? sender, BlazorWebViewInitializedEventArgs e)
    {
        Log.Information("BlazorWebView initialized.");
#if WINDOWS
        if (e.WebView is WebView2 webView)
        {
            if (webView.CoreWebView2 is not null)
            {
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
                webView.CoreWebView2.Settings.IsStatusBarEnabled = true;
            }

#if DEBUG
            webView.CoreWebView2?.OpenDevToolsWindow();
#endif
        }
#endif
    }

    private static void OnBlazorWebViewUrlLoading(object? sender, UrlLoadingEventArgs e)
    {
        Log.Information("BlazorWebView URL loading: {Url} ({Strategy})", e.Url, e.UrlLoadingStrategy);
    }
}
