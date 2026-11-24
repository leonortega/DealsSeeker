# Spec: `APP.NATIVE_MAP.001`

## Metadata
- **Title**: Native Map Surface
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers map, Add Offer location map
- **Priority**: Low

## Purpose
Render maps with the operating system's native map view instead of an embedded web page, keeping the existing marker, coverage, tap-to-pin and directions behavior.

## Preconditions
- The user is on the Offers map presentation or the Add Offer location step.
- The device provides a native map view.

## Trigger
- A map surface is rendered, tapped, or its coverage radius changes.

## Requirements
- `APP.NATIVE_MAP.001-R1`: Map surfaces shall be rendered by a native map view, not an embedded web view.
- `APP.NATIVE_MAP.001-R2`: Business markers shall be shown at their reported positions and shall preserve the existing selection behavior.
- `APP.NATIVE_MAP.001-R3`: The coverage radius shall be shown as a native shape around the center point.
- `APP.NATIVE_MAP.001-R4`: Tap-to-pin shall set the pin at the tapped coordinate when the caller enables it.
- `APP.NATIVE_MAP.001-R5`: The user marker and the selected pin shall remain visually distinct using the existing palette roles.
- `APP.NATIVE_MAP.001-R6`: The map shall follow the active theme without changing the brand palette.
- `APP.NATIVE_MAP.001-R7`: If the platform cannot render a native map, the existing fallback surface shall be used and the flow shall remain completable.
- `APP.NATIVE_MAP.001-R8`: Provider configuration shall select OS map behavior only; the web-based OpenLayers display provider shall no longer be used.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Map renders natively with markers and coverage
  Given the Offers map presentation is selected
  When the map surface is rendered
  Then a native map view shall display the businesses and coverage radius
  And no embedded web view shall be used for the map

Scenario: Marker selection is preserved
  Given business markers are visible
  When the user selects a marker
  Then the same offer selection behavior shall run as before

Scenario: Tap to pin is preserved
  Given the Add Offer map allows pin placement
  When the user taps a map coordinate
  Then the pin shall be set at that coordinate

Scenario: Theme follows the app palette
  Given the active theme changes
  When the map is rendered
  Then map accents shall continue to use the brand palette roles

Scenario: Platform without native map support
  Given the device cannot render a native map
  When a map surface is requested
  Then the existing fallback surface shall be shown
  And the user shall still be able to complete the flow
```

## Example Inputs/Outputs
- Example input: Offers map with three businesses and a 1000 m radius.
- Expected output: native map with three markers and a coverage circle; selecting a marker opens the same offer detail.

## Edge Cases
- A very large coverage radius that exceeds the visible area.
- A marker with missing coordinates — it shall be omitted without breaking the map.
- Rapid repeated taps while pin placement is enabled.
- Large text sizes where map overlays wrap.

## Non-Functional Constraints
- The native map dependency shall provide behavior only; no platform-native visual restyle of the brand UI shall be introduced.

## Related Specs
- `APP.CONFIG.MAPS.001`
- `OFFERS.MAP.001`
- `ADD.OFFER.LOCATION.003`
- `APP.THEME.001`
