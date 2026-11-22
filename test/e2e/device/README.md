# Device E2E suite (Maestro)

This suite replaces the web-only Playwright suite as the automated E2E path for the mobile-only client. It drives the real Android app through Maestro flows and uses the same accessibility labels verified on the emulator.

## Prerequisites

1. Java 17+ via `JAVA_HOME`, and the Maestro CLI installed (Windows: extract `maestro.zip` from the GitHub releases to `%LOCALAPPDATA%\DealsSeeker\Maestro`). The runner prepends both `bin` folders to `PATH` itself.
2. Start the API on `http://localhost:5005` — the runner registers a fresh user per flow **and seeds one offer** for `offers-*` / `ux-*` flows so the feed is not empty.
3. Start Metro on port `8081` and have the app installed on a connected device or emulator (package `com.anonymous.dealsseekerreactnative`). The flows tolerate the Expo dev-server picker and developer menu on first launch.
4. Set `DEVICE_SERIAL` if more than one device is connected (default `emulator-5554`). The runner clears app data before each flow so every flow starts logged out.

## Run

```powershell
# in src/DealsSeeker.ReactNative
npm run test:e2e:device
```

The runner registers a fresh user via the API, passes credentials to each flow with `maestro test -e EMAIL=... -e NEW_EMAIL=...`, and reports a per-flow pass/fail summary.

## Flows and web-test parity

| Behavior | Device flow |
|---|---|
| Add Offer modal + discard on Back (`APP.SHELL.003`) | `flows/app-shell-modal-back.yaml` |
| register from UI | `flows/auth-register.yaml` |
| login and logout | `flows/auth-login-logout.yaml` |
| invalid credentials | `flows/auth-invalid.yaml` |
| smart search | `flows/offers-search.yaml` |
| favorite an offer | `flows/offers-favorite.yaml` |
| publish a comment | `flows/offers-comment.yaml` |
| Feed/Map mode control | `flows/ux-mode-switch.yaml` |
| presentation persists | `flows/ux-persistence.yaml` |
| query survives mode switch | `flows/ux-query-persistence.yaml` |
| no results / clear filters | `flows/ux-no-results.yaml` |
| failed search + Retry | **gap** — Maestro cannot intercept HTTP; kept in the web suite until a device-side fault injection exists |
| phone landscape | `flows/ux-landscape.yaml` |
| help opens/closes | `flows/ux-help.yaml` |
| single Create FAB | `flows/ux-create-fab.yaml` |

## Known gaps

- **Current run: 12/13 flows pass.** A diagnostic proxy confirmed the app sends the correct search requests and the API returns offers; `ux-no-results.yaml` was fixed by scrolling the state panel into view. `offers-comment.yaml` remains failing: this emulator's offer feed never renders offer cards (no `Comments` control appears) even when the API returns offers, including for a pre-existing user. The flow is kept failing, not skipped, until that environment issue is fixed.
- Network fault injection for the failed-search test needs either an API test flag or a proxy; until then that single scenario stays on the web suite.
- Landscape is covered by `setOrientation: LANDSCAPE_LEFT`, which also restores portrait.
- TalkBack/VoiceOver remain manual checks.
- Flows were written against the accessibility labels observed on the Android emulator; the offers search input carries an `accessibilityLabel` so Maestro can target it by text.
- `E2E_FLOWS=flow1.yaml,flow2.yaml` runs a subset; `DEVICE_SERIAL` selects the device.

The two remaining scenarios are tracked coverage gaps, not a release block. The web Playwright suite was removed with the web client; `npm run test:e2e` now runs this device suite.
