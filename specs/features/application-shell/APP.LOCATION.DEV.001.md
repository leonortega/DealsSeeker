# Spec: `APP.LOCATION.DEV.001`

## Metadata
- **Title**: Developer Location Override for Emulators
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell, Offers View
- **Priority**: Low

## Purpose
Let an emulator use a configured development position when the platform cannot provide a usable location, so location-dependent discovery can be exercised end to end.

## Preconditions
- The app runs in a development build on an emulator or device without a working location provider.
- A developer location value is present in the local, untracked environment configuration.

## Trigger
- The Offers view resolves the user's location.

## Requirements
- `APP.LOCATION.DEV.001-R1`: When a valid developer location value is configured, the system shall use it in place of device geolocation.
- `APP.LOCATION.DEV.001-R2`: The developer location value shall not be part of tracked configuration and shall not affect release builds.
- `APP.LOCATION.DEV.001-R3`: With the override active, the system shall run a location-bound search with that position and shall not display the no-position state defined in `APP.LOCATION.UNAVAILABLE.001`.
- `APP.LOCATION.DEV.001-R4`: The override shall not change search, coverage radius, map markers or coordinate-privacy behavior.
- `APP.LOCATION.DEV.001-R5`: A missing or malformed override shall be ignored; device geolocation shall be attempted, and if no usable position is then available the no-location-bound-search behavior of `APP.LOCATION.FALLBACK.001` shall apply.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Emulator uses the configured developer location
  Given a valid developer location is configured
  And the device cannot provide a position
  When the Offers view loads
  Then the configured location shall be used for search and map context
  And the no-position state shall not be displayed
  And the area label shall describe the resolved location

Scenario: Malformed override is ignored
  Given the developer location value is malformed
  When the Offers view loads
  Then the override shall be ignored
  And device geolocation shall be attempted
  And no location-bound search shall run if no position is obtained

Scenario: Override does not change discovery behavior
  Given a valid developer location is configured
  When the user changes the coverage radius or runs a search
  Then results and map markers shall follow the configured location and selected radius
  And no raw coordinate value shall be displayed
```

## Example Inputs/Outputs
- Example input: `EXPO_PUBLIC_EMULATOR_LOCATION=40.7128,-74.006` on an emulator with no GPS fix.
- Expected output: Offers load for that area with no location-unavailable state displayed.

## Edge Cases
- One or both coordinates missing or non-numeric.
- Values outside valid latitude/longitude ranges.
- Override present while device location is actually available (override still wins).

## Non-Functional Constraints
- The override shall be read from environment configuration only; no user-facing setting shall be added.

## Related Specs
- `APP.LOCATION.FALLBACK.001`
- `APP.LOCATION.UNAVAILABLE.001`
- `APP.LOCATION.DEVICE.001`
- `OFFERS.SEARCH.001`
- `OFFERS.MAP.001`
