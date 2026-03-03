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
- `Maps:DisplayProvider` / `Maps:DisplayFallbackProvider` (in-view map rendering + location lookup)
- `Maps:RedirectProvider` / `Maps:RedirectFallbackProvider` (offer/marker redirect behavior)
- `OpenLayers:*` (Photon geocoding settings)
- `GoogleMaps:ApiKey` (required only when `GoogleMaps` is active/fallback and used)

Mobile internal config:
- `Api:MapDisplayProvider` / `Api:MapDisplayProviderFallback`
- `Api:MapRedirectProvider` / `Api:MapRedirectProviderFallback`
- environment variables also supported:
  - `DEALSEEKER_MAP_DISPLAY_PROVIDER`
  - `DEALSEEKER_MAP_DISPLAY_PROVIDER_FALLBACK`
  - `DEALSEEKER_MAP_REDIRECT_PROVIDER`
  - `DEALSEEKER_MAP_REDIRECT_PROVIDER_FALLBACK`
  - legacy compatibility: `DEALSEEKER_MAP_PROVIDER`, `DEALSEEKER_MAP_PROVIDER_FALLBACK`

## Persistence (Dapper + SQLite)
- API persistence uses `Dapper` with `SQLite`.
- DB schema is created/updated from SQL migrations at app startup.
- Migration files: `src/DealsSeeker.Api/Persistence/Migrations/*.sql`
- Default DB file: `Data/dealseeker.db` (configured via `Database:ConnectionString`).

Session persistence:
- Auth sessions (tokens) are stored in SQLite table `auth_sessions`.
- Expired or invalid sessions are rejected by API profile/token validation.

## Logging (Serilog)
- API logging uses `Serilog` with configurable minimum levels from configuration.
- Sinks:
  - rolling file logs: `Logs/dealseeker-*.log`
  - SQLite logs table: `logs` in the same DB
- Configuration sections:
  - `Serilog` (global logging + file sink)
  - `LoggingPersistence` (database sink enable + minimum level)
