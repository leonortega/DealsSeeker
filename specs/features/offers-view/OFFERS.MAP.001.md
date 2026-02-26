# Spec: `OFFERS.MAP.001`

## Metadata
- **Title**: Map Display and Walking Navigation Launch
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Show user and business locations and support walking navigation to selected business.

## Preconditions
- User is in Offers view.
- Location permission is available or handled by platform rules.

## Trigger
- Offers map is rendered and user selects a business marker or an offer item destination action.

## Requirements
- `OFFERS.MAP.001-R1`: The system shall display the user current location on the map when available.
- `OFFERS.MAP.001-R2`: The system shall display nearby businesses that have active offers.
- `OFFERS.MAP.001-R3`: The system shall display a distance indicator bar representing coverage radius.
- `OFFERS.MAP.001-R4`: Map rendering provider shall be resolved from internal configuration.
- `OFFERS.MAP.001-R5`: The map rendering layer shall support configured provider modules including Google Maps API and OpenLayers API.
- `OFFERS.MAP.001-R6`: On business marker selection, the system shall open walking navigation with selected location preloaded.
- `OFFERS.MAP.001-R7`: On offer item selection for directions, the system shall open walking navigation with selected offer location preloaded.
- `OFFERS.MAP.001-R8`: Navigation launch shall be platform-aware: desktop opens browser walking directions; mobile opens native map app when available, otherwise browser fallback.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User opens walking directions from selected marker
  Given the Offers map displays a business marker with active offers
  And map provider is resolved from internal configuration
  When the user selects that marker
  Then walking navigation shall open
  And the selected business location shall be preloaded
  And navigation mode shall be set to walking directions

Scenario: User opens walking directions from selected offer item
  Given the Offers list displays an offer with a location
  And map provider is resolved from internal configuration
  When the user selects the offer item for directions
  Then walking navigation shall open with the offer location preloaded
  And desktop clients shall open browser directions
  And mobile clients shall open native map app in walking mode when available
  And browser fallback shall be used when native app is unavailable
```

## Example Inputs/Outputs
- Example input: Tap business marker at known coordinates.
- Expected output: External walking directions open with selected destination.
- Example input: Tap offer item destination action on desktop.
- Expected output: Browser opens walking directions with selected destination.

## Edge Cases
- Location permission denied: map still shows business markers when available.
- Native map app unavailable on mobile: system falls back to browser walking directions.

## Non-Functional Constraints
- Map updates shall stay consistent with current offer filter state.

## Related Specs
- `OFFERS.SEARCH.001`
- `APP.CONFIG.MAPS.001`
