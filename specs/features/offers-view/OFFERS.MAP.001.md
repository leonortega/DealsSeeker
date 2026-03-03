# Spec: `OFFERS.MAP.001`

## Metadata
- **Title**: Map Display and Walking Navigation Launch
- **Version**: `v1.5`
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
- `OFFERS.MAP.001-R4`: Offers map rendering provider shall be resolved from internal configuration.
- `OFFERS.MAP.001-R5`: The map rendering layer shall support configured provider modules including Google Maps API and OpenLayers API.
- `OFFERS.MAP.001-R6`: On business marker selection, the system shall open walking navigation with selected location preloaded.
- `OFFERS.MAP.001-R7`: On offer item selection for directions, the system shall open walking navigation with selected offer location preloaded.
- `OFFERS.MAP.001-R8`: Navigation redirect provider shall be resolved from internal configuration independently from map rendering provider.
- `OFFERS.MAP.001-R9`: Navigation launch shall be platform-aware: desktop opens browser walking directions; mobile opens native map app when available, otherwise browser fallback.
- `OFFERS.MAP.001-R10`: Offers view location text shown to users shall use human-readable address labels.
- `OFFERS.MAP.001-R11`: Raw coordinate values (`lat`, `lng`) shall not be displayed to users in Offers view UI text.
- `OFFERS.MAP.001-R12`: Raw coordinate values (`lat`, `lng`) shall remain available in internal data for map rendering, filtering, navigation, and persistence.
- `OFFERS.MAP.001-R13`: If an address label is unavailable, the UI shall show a generic non-coordinate location label.
- `OFFERS.MAP.001-R14`: The map distance/coverage indicator shall reflect the current selected coverage radius value.
- `OFFERS.MAP.001-R15`: When coverage radius changes, map marker set shall refresh according to the new radius filter.
- `OFFERS.MAP.001-R16`: Offer click/marker click navigation redirect shall use the configured navigation redirect provider even when map rendering uses a different provider.
- `OFFERS.MAP.001-R17`: When coverage radius changes, map zoom shall adjust to visualize the selected radius coverage around the user location.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User opens walking directions from selected marker
  Given the Offers map displays a business marker with active offers
  And map rendering provider is resolved from internal configuration
  And navigation redirect provider is resolved from internal configuration
  When the user selects that marker
  Then walking navigation shall open
  And the selected business location shall be preloaded
  And navigation mode shall be set to walking directions

Scenario: User opens walking directions from selected offer item
  Given the Offers list displays an offer with a location
  And map rendering provider is resolved from internal configuration
  And navigation redirect provider is resolved from internal configuration
  When the user selects the offer item for directions
  Then walking navigation shall open with the offer location preloaded
  And desktop clients shall open browser directions
  And mobile clients shall open native map app in walking mode when available
  And browser fallback shall be used when native app is unavailable

Scenario: Rendering and redirect providers can be different
  Given map rendering provider is configured as OpenLayers
  And navigation redirect provider is configured as Google Maps
  When the user opens walking directions from an offer
  Then in-view map shall continue using OpenLayers
  And navigation redirect shall use Google Maps

Scenario: Offers view location text hides coordinates
  Given the Offers view is rendered with current user location and business markers
  When location context text is shown in the UI
  Then location values shall be shown as human-readable address labels
  And raw latitude/longitude values shall not be visible in location text
  And map and navigation behavior shall still use internal coordinates

Scenario: Coverage radius change refreshes map coverage and markers
  Given the Offers map is rendered with current coverage radius
  When the user changes the coverage radius value
  Then the map distance/coverage indicator shall show the new radius value
  And map markers shall refresh using the new radius filter
  And map zoom shall adjust to show the selected radius coverage
```

## Example Inputs/Outputs
- Example input: Tap business marker at known coordinates.
- Expected output: External walking directions open with selected destination.
- Example input: Tap offer item destination action on desktop.
- Expected output: Browser opens walking directions with selected destination.

## Edge Cases
- Location permission denied: map still shows business markers when available.
- Native map app unavailable on mobile: system falls back to browser walking directions.
- Address label unavailable: UI shows generic location label without numeric coordinates.

## Non-Functional Constraints
- Map updates shall stay consistent with current offer filter state.

## Related Specs
- `OFFERS.SEARCH.001`
- `APP.CONFIG.MAPS.001`
