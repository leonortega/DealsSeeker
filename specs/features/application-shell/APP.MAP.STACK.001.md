# Spec: `APP.MAP.STACK.001`

## Metadata
- **Title**: Single Map and Geocoding Stack
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, Offers map, Add Offer location map
- **Priority**: High

## Purpose
Use one map stack everywhere: a native Google Maps view for display and Photon through the app API for address search and reverse geocoding.

## Preconditions
- The device supplies a native map view and the app has a Google Maps credential.

## Trigger
- Any map surface is rendered, a place is searched, a coordinate is reverse-geocoded, or external directions are opened.

## Requirements
- `APP.MAP.STACK.001-R1`: Every in-app map surface shall be a native map view backed by Google Maps.
- `APP.MAP.STACK.001-R2`: No alternate in-app map renderer, including a web-based map page or a scripted map library, shall be bundled or used as a fallback.
- `APP.MAP.STACK.001-R3`: Address search and reverse geocoding shall be served exclusively by Photon through the app API; the app shall not call any other geocoding service.
- `APP.MAP.STACK.001-R4`: External directions from offer cards, detail actions, and markers shall open Google Maps; no alternate redirect provider shall be offered.
- `APP.MAP.STACK.001-R5`: No runtime setting shall switch map display, geocoding, or redirect providers.
- `APP.MAP.STACK.001-R6`: Consolidating the stack shall preserve marker selection, coverage radius, tap-to-pin, coordinate privacy, theming, and provider-failure reporting defined by the related specs.
- `APP.MAP.STACK.001-R7`: If the native map or Google Maps credential is unavailable, the app shall report the failure without showing an alternate map surface.

## Acceptance Criteria (BDD)
```gherkin
Scenario: All map surfaces use the single native stack
  Given the app renders an Offers map and an Add Offer mini map
  When both map surfaces are displayed
  Then both shall use the native Google Maps view
  And no web-based map renderer shall be present

Scenario: Places and coordinates are resolved by Photon only
  Given the user searches for a place or picks a point on a map
  When the lookup is issued
  Then it shall be served by Photon through the app API
  And no other geocoding service shall be called

Scenario: Directions always open Google Maps
  Given an offer, a marker, or a detail action offers directions
  When the user opens directions
  Then Google Maps shall be opened with the selected destination and travel mode

Scenario: No provider switches are exposed
  Given the user opens application settings
  When map, geocoding, or redirect provider options are looked for
  Then no such options shall be available

Scenario: Native map cannot be initialized
  Given the native map or its credential is unavailable
  When a map surface is requested
  Then the app shall report the failure
  And no alternate map surface shall be shown
```

## Example Inputs/Outputs
- Example input: Open Offers map, Add Offer mini map, and a directions action in one session.
- Expected output: One native Google Maps surface and one Google Maps redirect; all text lookups and coordinate lookups go through Photon via the app API.

## Edge Cases
- Google Maps credential missing or invalid.
- Native map view unavailable on a device.
- Photon unavailable or rate-limited.
- Cached Photon result reused while Photon is unreachable.

## Non-Functional Constraints
- Removing alternate implementations shall not add a new dependency.

## Related Specs
- `APP.CONFIG.MAPS.001`
- `APP.NATIVE_MAP.001`
- `APP.LOCATION.PROVIDER.RESILIENCE.001`
- `APP.LOCATION.QUERY.001`
- `OFFERS.MAP.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.LOCATION.002`
- `ADD.OFFER.LOCATION.003`
- `APP.NAVIGATION.MODE.001`
