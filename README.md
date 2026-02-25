# DealsSeeker (.NET 8 Option 1)

Implementation stack:
- `DealsSeeker.Mobile`: .NET MAUI Blazor Hybrid mobile app.
- `DealsSeeker.Api`: ASP.NET Core 8 Minimal API.
- `DealsSeeker.Shared`: shared contracts/models.

## Solution
- `DealsSeeker.sln`
- `src/DealsSeeker.Mobile`
- `src/DealsSeeker.Api`
- `src/DealsSeeker.Shared`

## Spec Mapping
- `APP.SHELL.001`: Bottom navigation with `My Account`, `Offers`, `Suggestions`, `Reports`; default route redirects to `/offers`.
- `OFFERS.*`: Offers page with tag search, map section, distance bar, offer list, actions, and add-offer navigation.
- `ADD.OFFER.*`: Add Offer page with image capture/upload, auto location, location search, confirm location, and tag long-press logic.

## Run
1. Install .NET 8 SDK and MAUI workload (if not already installed):
```powershell
Invoke-WebRequest https://dot.net/v1/dotnet-install.ps1 -OutFile $env:TEMP\dotnet-install.ps1
& $env:TEMP\dotnet-install.ps1 -Channel 8.0 -InstallDir $env:USERPROFILE\.dotnet8
& $env:USERPROFILE\.dotnet8\dotnet.exe workload install maui
```
2. Run API:
```powershell
$dotnet = "$env:USERPROFILE\.dotnet8\dotnet.exe"
& $dotnet run --project src/DealsSeeker.Api
```
3. Run mobile app (Windows target):
```powershell
$dotnet = "$env:USERPROFILE\.dotnet8\dotnet.exe"
& $dotnet build src/DealsSeeker.Mobile/DealsSeeker.Mobile.csproj -f net8.0-windows10.0.19041.0
& $dotnet run --project src/DealsSeeker.Mobile/DealsSeeker.Mobile.csproj -f net8.0-windows10.0.19041.0
```

## Google Maps API key
Set `GoogleMaps:ApiKey` in:
- `src/DealsSeeker.Api/appsettings.json`
- or user secrets / environment variables in development.
