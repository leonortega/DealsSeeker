# Spec: `APP.LOCATION.DEVICE.001`

## Metadata
- **Title**: Platform Location Provider Access on Android
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell, Offers View
- **Priority**: High

## Purpose
Obtain the device position from the operating system's location provider so that locations injected into an emulator are usable by the app.

## Preconditions
- The user is authenticated and in the Offers section.
- Foreground location permission has been requested and granted.

## Trigger
- The Offers view resolves the user's location, or the user selects the location retry action.

## Requirements
- `APP.LOCATION.DEVICE.001-R1`: On Android, the system shall obtain the position from the platform location provider (GPS or network) rather than a third-party fused-location service.
- `APP.LOCATION.DEVICE.001-R2`: The system shall use the most recent provider position only when it is fresh enough to represent the current area, and shall otherwise wait for a new provider update.
- `APP.LOCATION.DEVICE.001-R3`: A position request shall complete within a bounded time and shall report failure instead of waiting indefinitely.
- `APP.LOCATION.DEVICE.001-R4`: Permission denial, disabled providers and timeouts shall each produce a recoverable failure; no location-bound search shall run, and the single no-position state defined in `APP.LOCATION.UNAVAILABLE.001` shall apply under the prohibition in `APP.LOCATION.FALLBACK.001`.
- `APP.LOCATION.DEVICE.001-R5`: On iOS the system shall continue to use the platform location API exposed by the cross-platform location library.
- `APP.LOCATION.DEVICE.001-R6`: The position shall be used for search and map context only; raw coordinates shall not be displayed, per the coordinate-privacy constraint.
- `APP.LOCATION.DEVICE.001-R7`: A configured developer location override from `APP.LOCATION.DEV.001` shall take precedence over the platform position.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Android uses the platform provider position
  Given the user is on Android with foreground location granted
  And the platform provider has a current position
  When the Offers view resolves the location
  Then the platform position shall be used for search and map context
  And no location-unavailable state shall be displayed

Scenario: Emulator-injected position is used
  Given the Android emulator has a position set through its location controls
  When the user selects the location retry action
  Then the injected position shall be used for search and map context
  And the area label shall describe the resolved location

Scenario: Provider request times out
  Given the platform provider has no fresh position and produces no update
  When the user selects the location retry action
  Then a plain-language failure status shall be shown within the bounded time
  And the no-position state shall remain with its retry action
  And no results for a substitute area shall be displayed

Scenario: Permission denied on Android
  Given foreground location permission is denied
  When the user selects the location retry action
  Then the denial shall be handled as a recoverable location failure
  And no raw coordinate shall be displayed
```

## Example Inputs/Outputs
- Example input: Android emulator with a platform-provided position.
- Expected output: Offers search and map centered on that area; no location-unavailable state displayed.

## Edge Cases
- GPS disabled but network provider enabled.
- Stale cached position with no new update.
- Permission revoked while the app is in the foreground.
- Failure while the immersive feed is displayed.
- A cached position exists but is too stale to represent the current area: no location-bound search shall use it.

## Non-Functional Constraints
- No new third-party location dependency shall be added; the platform module is implemented locally.
- Location work shall not block the UI thread.

## Related Specs
- `APP.LOCATION.FALLBACK.001`
- `APP.LOCATION.UNAVAILABLE.001`
- `APP.LOCATION.DEV.001`
- `OFFERS.SEARCH.001`
- `OFFERS.MAP.001`
