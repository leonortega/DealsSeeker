# Spec: `APP.CONFIG.MAPS.001`

## Metadata
- **Title**: Google Maps Credential Configuration
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define how the single native map stack obtains its Google Maps credential; provider switching is retired by `APP.MAP.STACK.001`.

## Preconditions
- The application has access to configuration supplied through its environment.

## Trigger
- Application startup or map-dependent feature initialization.

## Requirements
- `APP.CONFIG.MAPS.001-R1`: In-app map rendering shall use the native map view defined by `APP.NATIVE_MAP.001`; web-based display providers shall not be used.
- `APP.CONFIG.MAPS.001-R2`: The native map shall obtain its Google Maps credential from configuration supplied through the app's environment.
- `APP.CONFIG.MAPS.001-R3`: External navigation redirect shall open Google Maps from offer cards, detail actions, and markers; no redirect provider switch shall be available.
- `APP.CONFIG.MAPS.001-R4`: A missing or invalid credential shall be reported as a configuration error and shall not cause an alternate map surface to be shown.
- `APP.CONFIG.MAPS.001-R5`: Address search and reverse geocoding shall not use the Google Maps credential; those lookups are defined by `APP.MAP.STACK.001`.
- `APP.CONFIG.MAPS.001-R6`: Offers and Add Offer maps shall use the same native map surface with markers and coverage as defined by `APP.NATIVE_MAP.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Native map uses the configured Google credential
  Given the environment supplies a Google Maps credential
  When the app initializes map-dependent features
  Then Offers and Add Offer maps shall render natively with that credential
  And offer navigation redirects shall open Google Maps

Scenario: No provider switching is available
  Given the app is fully initialized
  When map display, geocoding, or redirect configuration is inspected
  Then no alternative provider selection shall be applied

Scenario: Missing credential is a configuration error
  Given no usable Google Maps credential is supplied
  When a map-dependent feature is requested
  Then the failure shall be reported
  And no fallback map surface shall be rendered
```

## Example Inputs/Outputs
- Example input: Google Maps credential supplied through the environment.
- Expected output: Offers and Add Offer maps render natively; offer redirects open Google Maps.
- Example input: no credential supplied.
- Expected output: a configuration error is reported; no web map is shown.

## Edge Cases
- Credential present but rejected by Google Maps.
- Credential removed after a previous successful launch.
- Map requested while the credential is being validated.

## Non-Functional Constraints
- The credential shall not be logged or shown to the user.

## Related Specs
- `APP.MAP.STACK.001`
- `APP.NATIVE_MAP.001`
- `OFFERS.MAP.001`
- `ADD.OFFER.LOCATION.001`
- `APP.LOCATION.PROVIDER.RESILIENCE.001`
- `APP.NAVIGATION.MODE.001`
