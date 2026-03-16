# DealsSeeker React Native

Expo-based React Native frontend for the existing `DealsSeeker.Api`.

## Environment

Set these variables before running:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://10.0.2.2:5005"
$env:EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=""
$env:EXPO_PUBLIC_MAP_DISPLAY_PROVIDER="OpenLayers"
$env:EXPO_PUBLIC_MAP_DISPLAY_PROVIDER_FALLBACK="OpenLayers"
$env:EXPO_PUBLIC_MAP_REDIRECT_PROVIDER="GoogleMaps"
$env:EXPO_PUBLIC_MAP_REDIRECT_PROVIDER_FALLBACK="OpenLayers"
```

Android emulator builds should use `http://10.0.2.2:5005`. On a physical device, replace it with a host reachable from that device.

## Run

```powershell
cd src/DealsSeeker.ReactNative
npm install
npm run start:dev-client
```

For Android, use the helper script from the repo root so Windows path length and Android SDK variables are handled consistently:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-reactnative-android.ps1
```

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
