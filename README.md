# DealsSeeker (.NET 10 Option 1)

Implementation stack:
- `DealsSeeker.ReactNative`: Expo/React Native mobile client (iOS and Android).
- `DealsSeeker.Api`: ASP.NET Core 10 Minimal API.
- `DealsSeeker.Shared`: shared contracts/models.

## Solution
- `DealsSeeker.sln`
- `src/DealsSeeker.ReactNative`
- `src/DealsSeeker.Api`
- `src/DealsSeeker.Shared`

## Spec Mapping
- `APP.SHELL.001`: Bottom navigation with `My Account`, `Offers`, `Suggestions`, `Reports`; default route redirects to `/offers`.
- `APP.NAVIGATION.MODE.001`: Per-user directions mode preference (`pedestrian` or `car`) applied to offer navigation actions.
- `OFFERS.*`: Offers page with tag search, map section, distance bar, offer list, actions, and add-offer navigation.
- `ADD.OFFER.*`: Add Offer page with image capture/upload, auto location, location search, confirm location, and tag long-press logic.

## Run (React Native UI + API, two terminals)
The React Native client expects the API on port **5005**. Both scripts start the API and the client
in separate terminals; close each terminal with `Ctrl+C`.

| Command | Effect |
|---|---|
| `.\scripts\run-expo-go.ps1` | Start the API and Metro for a physical device running Expo Go (tunnel mode) |
| `.\scripts\run-expo-go.ps1 -Clear` | Same, clearing the Metro cache after dependency/config changes |
| `.\scripts\run-expo-go.ps1 -MetroHost lan` | Use the LAN address instead of the tunnel (port 8081 must be reachable from the device) |
| `.\scripts\run-reactnative-android.ps1` | Start the API and build/launch a local native Android app on an emulator or USB device |
| `.\scripts\run-reactnative-android.ps1 -Target api` | Run only the API, in the current terminal |

The API base URL handed to the client follows the chosen platform:

| Platform | API base URL |
|---|---|
| `android` emulator | `http://10.0.2.2:5005` — the emulator alias for the host |
| physical device | `http://<machine-lan-ip>:5005` |

Device setup, Expo Go requirements, and the note that EAS is reserved for future Play Store publishing
are in `src/DealsSeeker.ReactNative/README.md`.

## Map and Geocoding Configuration
One stack everywhere: native Google Maps for in-app rendering and external directions; Photon through the API for address search and reverse geocoding. There are no provider switches or fallback renderers.

API config (`src/DealsSeeker.Api/appsettings.json`):
- `Photon:BaseUrl`, `Photon:UserAgent`, `Photon:MaxResults` (Photon geocoding settings)
- `MapProviderResilience:*` (timeout, retry and circuit breaker for Photon)

React Native client config (environment variables, see `src/DealsSeeker.ReactNative/README.md`):
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (required for native map tiles)
- `EXPO_PUBLIC_API_BASE_URL` (API base URL)

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
