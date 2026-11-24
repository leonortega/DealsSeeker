# Spec: `APP.CONFIG.MAPS.001`

## Metadata
- **Title**: Configurable Map Provider Modules
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define internal configuration rules for map provider modules used by the app.

## Preconditions
- The application has access to internal configuration.

## Trigger
- Application startup or map-related service initialization.

## Requirements
- `APP.CONFIG.MAPS.001-R1`: In-app map rendering shall use the platform's native map view; web-based display providers shall not be used for the primary map surface.
- `APP.CONFIG.MAPS.001-R2`: The native map shall obtain its credentials from configuration supplied through the app's environment.
- `APP.CONFIG.MAPS.001-R3`: Map provider for external navigation redirect (offer click / marker click) shall still be selected from internal app configuration independently from in-app rendering.
- `APP.CONFIG.MAPS.001-R4`: The system shall support a `Google Maps` credential for Android native map rendering.
- `APP.CONFIG.MAPS.001-R5`: The `OpenLayers` web display provider is retired for in-app rendering; it may remain only as a fallback surface as defined by `APP.NATIVE_MAP.001`.
- `APP.CONFIG.MAPS.001-R6`: Offers/Add Offer map rendering shall use the native map surface with markers and coverage as defined by `APP.NATIVE_MAP.001`.
- `APP.CONFIG.MAPS.001-R7`: Offer navigation redirect shall use the configured navigation redirect provider from offer cards, detail actions, and any available in-map interaction UI.
- `APP.CONFIG.MAPS.001-R8`: If the native map is unavailable at runtime, the system shall fail gracefully and use the configured fallback surface without removing navigation access.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Native map uses configured Google credential and redirect
  Given the environment supplies a Google Maps credential
  And internal configuration sets navigation redirect provider to Google Maps
  When the app initializes map-dependent features
  Then Offers and Add Offer maps shall render natively with that credential
  And offer navigation redirects shall use Google Maps

Scenario: Redirect provider remains independently configurable
  Given the in-app map is native
  When internal configuration selects a navigation redirect provider
  Then in-map and offer-card redirects shall use that provider
  And the native map surface shall not change

Scenario: Native map failure uses fallback behavior
  Given the native map cannot be initialized
  When a map-dependent feature is requested
  Then the configured fallback surface shall be used
  And the app shall not crash
```

## Example Inputs/Outputs
- Example input: Google credential supplied through the environment, `MapRedirectProvider=GoogleMaps`.
- Expected output: In-view maps render natively and offer click redirects use Google Maps.
- Example input: native map unavailable on the device.
- Expected output: the configured fallback map surface is shown without a crash.

## Edge Cases
- Unknown provider key in configuration.
- Provider API key missing or invalid.
- Provider service temporarily unavailable.

## Non-Functional Constraints
- Provider switching through configuration should not require feature-spec changes.

## Related Specs
- `OFFERS.MAP.001`
- `ADD.OFFER.LOCATION.001`
- `APP.LOCATION.PROVIDER.RESILIENCE.001`
- `ADD.OFFER.LOCATION.003`
- `APP.POLISH.UX.001`
- `APP.NATIVE_MAP.001`
