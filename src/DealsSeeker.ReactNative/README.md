# DealsSeeker React Native

Expo-based React Native frontend for the existing `DealsSeeker.Api`.

## Environment

Set these variables before running:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://10.0.2.2:5005"
$env:EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

Maps use the native Google Maps view and directions always open Google Maps. Address search and reverse geocoding are served by Photon through the API; there are no provider switches.

Android emulator builds should use `http://10.0.2.2:5005`. On a physical device, replace it with a host reachable from that device.

If the emulator has no working location provider, set `EXPO_PUBLIC_EMULATOR_LOCATION` in the untracked `.env.local` to a `latitude,longitude` pair (for example `40.7128,-74.006`). The client then uses that position instead of device geolocation and skips the approximate-area notice. Remove the variable to go back to device location. The value must stay out of tracked/release configuration.

## Run the API (backend)

The React Native client requires `DealsSeeker.Api` to be running. From the repository root, with the .NET 10 SDK installed:

```powershell
# Default profile (https://localhost:7132; http://localhost:5005)
dotnet run --project src/DealsSeeker.Api

# HTTP-only profile (recommended for Android emulator / device testing)
dotnet run --project src/DealsSeeker.Api --launch-profile http
```

Make sure `EXPO_PUBLIC_API_BASE_URL` (set in the Environment section) points to the API URL reachable from your device or emulator.

## Run

```powershell
cd src/DealsSeeker.ReactNative
npm install
npm run start:dev-client
```

For Android, use the helper script from the repo root. It starts the API and the app in separate
terminals, resolves the Android SDK/JDK, starts an emulator when needed, and builds/launches the app:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-reactnative-android.ps1
```

## Physical device with Expo Go

Use this for day-to-day development on a phone. No local native build, USB cable, EAS build, or Expo account is required.

```powershell
# from the repository root
powershell -ExecutionPolicy Bypass -File .\scripts\run-expo-go.ps1
```

The script starts the API in a separate terminal and Metro in the current one. Metro uses tunnel mode by
default, so no inbound firewall rule is needed. Use `-MetroHost lan` if port 8081 is already reachable
from the device. Use `-Clear` to discard a stale bundle cache after changing native dependencies or app config.

On the phone:
1. Install Expo Go **for SDK 58** from the Play Store (older versions cannot load this project).
2. Scan the QR code printed by Metro.
3. Keep the phone on the same Wi-Fi as this machine — the API is reached at `http://<machine-lan-ip>:5005`.

The custom `DealsSeekerLocation` native module is optional (`requireOptionalNativeModule`), so Expo Go
falls back to `expo-location`. `react-native-maps` is included in Expo Go; the Google Maps key from
`app.config.js` is ignored there and Expo Go's built-in key is used instead.

## EAS / store publishing (reserved — not used for development)

The Expo account, the EAS `projectId` in `app.json`, `eas.json`, and the EAS environment variable for
`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` are kept only for future Play Store publishing. Do not run EAS builds
for normal development: use Expo Go above, or `run-reactnative-android.ps1` for a local native build.

When publishing, add a `production` profile to `eas.json`, build an AAB with
`eas build --platform android --profile production`, and submit it through `eas submit` or the Play Console.
A Play Console account and a Maps key restricted to the production package name and signing SHA-1 are required.

## Validation

```powershell
cd src/DealsSeeker.ReactNative
npm run typecheck
```

## Scope

This client uses the existing API only:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/account/me`
- `GET /api/account/offers`
- `GET /api/account/offers/{offerId}`
- `POST /api/offers/search`
- `POST /api/offers/{offerId}/availability`
- `POST /api/offers/{offerId}/favorite`
- `POST /api/offers`
- `PUT /api/offers/{offerId}`
- `DELETE /api/offers/{offerId}`
- `GET /api/locations/search`
- `GET /api/locations/reverse`
- `POST /api/suggestions`
- `POST /api/reports`
