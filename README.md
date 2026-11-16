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
- `APP.NAVIGATION.MODE.001`: Per-user directions mode preference (`pedestrian` or `car`) applied to offer navigation actions.
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
4. Run mobile app (Android target):
```powershell
dotnet workload install maui
adb devices
$env:DEALSEEKER_API_BASEURL="http://10.0.2.2:5005"
dotnet run --project src/DealsSeeker.Mobile/DealsSeeker.Mobile.csproj -f net10.0-android
```

Android notes:
- Start the API with the HTTP launch profile when testing from the Android emulator:
```powershell
dotnet run --project .\src\DealsSeeker.Api --launch-profile http
```
- `10.0.2.2` is the Android emulator alias for the host machine. Do not use `localhost` from the emulator.
- For a physical Android device, set `DEALSEEKER_API_BASEURL` to your PC's LAN IP instead of `10.0.2.2`.

## Run (React Native UI + API, two terminals)
The React Native client expects the API on port **5005**. The `run-dev.ps1` script starts both
processes as independent consoles: the API in one terminal, the Expo UI in the other.

```powershell
# Open two terminals: one for the API, one for the UI
.\scripts\run-dev.ps1
```

The script waits for the API to report healthy before starting the UI, so the UI never races the
API. Close each terminal with `Ctrl+C`.

| Command | Effect |
|---|---|
| `.\scripts\run-dev.ps1` | Open the API and the UI in two separate terminal windows |
| `.\scripts\run-dev.ps1 -Target api` | Run only the API, in the current terminal |
| `.\scripts\run-dev.ps1 -Target ui` | Run only the UI, in the current terminal |
| `.\scripts\run-dev.ps1 -Platform ios` | Point the UI at `http://localhost:5005` |
| `.\scripts\run-dev.ps1 -Platform device -ApiHost 0.0.0.0` | Run against a physical device on the same network |
| `.\scripts\run-dev.ps1 -Clear` | Clear the Expo bundler cache before starting the UI |
| `.\scripts\run-dev.ps1 -Wait` | Keep the launching terminal open until `Ctrl+C` |

The API base URL handed to the UI follows the chosen platform:

| Platform | API base URL |
|---|---|
| `android` (default) | `http://10.0.2.2:5005` — the emulator alias for the host |
| `ios` / `web` | `http://localhost:5005` |
| `device` | `http://<machine-lan-ip>:5005` |

## Map Provider Configuration
The app supports configurable map provider modules (`GoogleMaps`, `OpenLayers`).

API config (`src/DealsSeeker.Api/appsettings.json`):
- `Maps:DisplayProvider` / `Maps:DisplayFallbackProvider` (in-view map rendering + location lookup)
- `Maps:RedirectProvider` / `Maps:RedirectFallbackProvider` (offer/marker redirect behavior)
- `OpenLayers:*` (Photon geocoding settings)
- `GoogleMaps:ApiKey` (required only when `GoogleMaps` is active/fallback and used)

Mobile internal config:
- `Api:GoogleMapsApiKey` (required when in-app rendering uses `GoogleMaps` and no fallback is desired)
- `Api:MapDisplayProvider` / `Api:MapDisplayProviderFallback`
- `Api:MapRedirectProvider` / `Api:MapRedirectProviderFallback`
- environment variables also supported:
  - `DEALSEEKER_GOOGLE_MAPS_API_KEY`
  - `DEALSEEKER_MAP_DISPLAY_PROVIDER`
  - `DEALSEEKER_MAP_DISPLAY_PROVIDER_FALLBACK`
  - `DEALSEEKER_MAP_REDIRECT_PROVIDER`
  - `DEALSEEKER_MAP_REDIRECT_PROVIDER_FALLBACK`
  - legacy compatibility: `DEALSEEKER_MAP_PROVIDER`, `DEALSEEKER_MAP_PROVIDER_FALLBACK`

## Persistence (Dapper + SQLite)
- API persistence uses `Dapper` with `SQLite`.
- DB schema is created/updated from SQL migrations at app startup.
- Migration files: `src/DealsSeeker.Api/Persistence/Migrations/*.sql`
- Default DB file: `src/DealsSeeker.Api/Data/dealseeker.db` when running from the source tree. Relative SQLite paths are resolved against the API project root.

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
