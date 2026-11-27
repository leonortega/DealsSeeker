# Spec: `OFFERS.MAP.001`

## Metadata
- **Title**: Map Display and Configured Navigation Launch
- **Version**: `v1.9`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Show user and business locations and support navigation to selected business using the configured travel mode.

## Preconditions
- User is in Offers view.
- Location permission is available or handled by platform rules.

## Trigger
- Offers map is rendered and user selects a business marker or an offer item destination action.

## Requirements
- `OFFERS.MAP.001-R1`: The system shall display the user current location on the map when available.
- `OFFERS.MAP.001-R2`: The system shall display nearby businesses that have active offers as map markers.
- `OFFERS.MAP.001-R3`: The system shall display a distance indicator bar representing coverage radius.
- `OFFERS.MAP.001-R4`: The Offers map shall be rendered by the native Google Maps view defined by `APP.MAP.STACK.001`.
- `OFFERS.MAP.001-R5`: No alternate map renderer shall be used in the Offers view.
- `OFFERS.MAP.001-R6`: On business marker selection, the system shall open navigation with the configured travel mode and selected location preloaded.
- `OFFERS.MAP.001-R7`: On offer item selection for directions, the system shall open navigation with the configured travel mode and selected offer location preloaded.
- `OFFERS.MAP.001-R8`: Navigation redirect shall open the Google Maps HTTPS directions URL with the selected destination and a `travelmode` matching the user's selected mode.
- `OFFERS.MAP.001-R9`: The same HTTPS directions URL shall be used on every platform; the Google Maps app handles it when installed and a browser handles it otherwise. No native navigation URI that auto-starts driving shall be used.
- `OFFERS.MAP.001-R10`: Offers view location text shown to users shall use human-readable address labels.
- `OFFERS.MAP.001-R11`: Raw coordinate values (`lat`, `lng`) shall not be displayed to users in Offers view UI text.
- `OFFERS.MAP.001-R12`: Raw coordinate values (`lat`, `lng`) shall remain available in internal data for map rendering, filtering, navigation, and persistence.
- `OFFERS.MAP.001-R13`: If an address label is unavailable, the UI shall show a generic non-coordinate location label.
- `OFFERS.MAP.001-R14`: The map distance/coverage indicator shall reflect the current selected coverage radius value.
- `OFFERS.MAP.001-R15`: When coverage radius changes, map marker set shall refresh according to the new radius filter.
- `OFFERS.MAP.001-R16`: Offer click and marker click navigation redirect shall open Google Maps, the same provider used for in-app map rendering.
- `OFFERS.MAP.001-R17`: When coverage radius changes, map zoom shall adjust to visualize the selected radius coverage around the user location.
- `OFFERS.MAP.001-R18`: Navigation travel mode shall be resolved from user preferences, defaulting to pedestrian when no override exists.
- `OFFERS.MAP.001-R19`: Marker selection from the native map shall be delivered directly to the Offers view without a serialized cross-surface message bridge.
- `OFFERS.MAP.001-R20`: No map renderer or redirect provider switch shall be selectable from the Offers view.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User opens directions from selected marker
  Given the Offers map displays a business marker with active offers on the native Google Maps view
  And directions mode is configured as pedestrian
  When the user selects that marker
  Then Google Maps navigation shall open
  And the selected business location shall be preloaded
  And navigation mode shall be set to pedestrian directions

Scenario: User opens directions from selected offer item
  Given the Offers list displays an offer with a location
  And directions mode is configured as car
  When the user selects the offer item for directions
  Then the Google Maps HTTPS directions URL shall open with the offer location preloaded
  And the URL shall request `travelmode=driving`
  And navigation shall not start automatically
  And the Google Maps app shall handle the URL when installed, otherwise a browser

Scenario: The native renderer and redirect use the same provider
  Given the Offers map is rendered by the native Google Maps view
  And directions mode is configured as pedestrian
  When the user opens directions from an offer
  Then the in-view map shall continue using Google Maps
  And navigation redirect shall open Google Maps

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

Scenario: Marker selection is delivered directly by the native map
  Given the Offers map is rendered by the native map view
  When the user selects a business marker
  Then the selection shall be delivered directly to the Offers view
  And directions shall open for that marker
  And the Offers view shall continue operating without a runtime error

Scenario: No alternate renderer or provider switch is shown
  Given the Offers map presentation is selected
  When the user inspects the map and navigation controls
  Then no map renderer option shall be available
  And no redirect provider option shall be available
```

## Example Inputs/Outputs
- Example input: Tap business marker at known coordinates.
- Expected output: External directions open with selected destination using the configured travel mode.
- Example input: Tap offer item destination action on desktop.
- Expected output: Browser opens directions with selected destination using the configured travel mode.

## Edge Cases
- Location permission denied: map still shows business markers when available.
- Native map app unavailable on mobile: system falls back to browser directions.
- Address label unavailable: UI shows generic location label without numeric coordinates.
- Native map view is unavailable: the failure is reported and no web-based map is shown.
- A user tries to change map or redirect provider: no such option is available.

## Non-Functional Constraints
- Map updates shall stay consistent with current offer filter state.

## Related Specs
- `APP.HELP.CONTEXTUAL.001`
- `OFFERS.GUEST.001`
- `OFFERS.SEARCH.001`
- `APP.MAP.STACK.001`
- `APP.CONFIG.MAPS.001`
- `APP.NATIVE_MAP.001`
- `APP.LOCATION.QUERY.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `APP.NAVIGATION.MODE.001`
