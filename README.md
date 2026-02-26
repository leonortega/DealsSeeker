# DealsSeeker (.NET 10 Option 1)

Implementation stack:
- `DealsSeeker.Mobile`: .NET MAUI Blazor Hybrid mobile app.
- `DealsSeeker.Api`: ASP.NET Core 10 Minimal API.
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
1. Install .NET 10 SDK and MAUI workload (if not already installed):
```powershell
Invoke-WebRequest https://dot.net/v1/dotnet-install.ps1 -OutFile $env:TEMP\dotnet-install.ps1
& $env:TEMP\dotnet-install.ps1 -Channel 10.0
dotnet workload install maui
```
2. Run API:
```powershell
dotnet run --project src/DealsSeeker.Api
```
3. Run mobile app (Windows target):
```powershell
dotnet build src/DealsSeeker.Mobile/DealsSeeker.Mobile.csproj -f net10.0-windows10.0.19041.0
dotnet run --project src/DealsSeeker.Mobile/DealsSeeker.Mobile.csproj -f net10.0-windows10.0.19041.0
```

## Map Provider Configuration
The app supports configurable map provider modules (`GoogleMaps`, `OpenLayers`).

API config (`src/DealsSeeker.Api/appsettings.json`):
- `Maps:Provider` (default: `OpenLayers`)
- `Maps:FallbackProvider` (default: `GoogleMaps`)
- `OpenLayers:*` (Nominatim geocoding settings)
- `GoogleMaps:ApiKey` (required only when `GoogleMaps` is active/fallback and used)

Mobile internal config:
- `Api:MapProvider` / `Api:MapProviderFallback` (resolved in `MauiProgram`)
- environment variables also supported:
  - `DEALSEEKER_MAP_PROVIDER`
  - `DEALSEEKER_MAP_PROVIDER_FALLBACK`
