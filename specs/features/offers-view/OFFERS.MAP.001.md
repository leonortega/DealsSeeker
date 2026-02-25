# Spec: `OFFERS.MAP.001`

## Metadata
- **Title**: Map Display and Walking Navigation Launch
- **Version**: `v1.0`
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
- `OFFERS.MAP.001-R4`: On business marker selection, the system shall open Google Maps with the selected location preloaded.
- `OFFERS.MAP.001-R5`: Navigation mode shall be walking directions.
- `OFFERS.MAP.001-R6`: On offer item selection for directions, the system shall open Google Maps with the selected offer location preloaded.
- `OFFERS.MAP.001-R7`: Map launch shall be platform-aware: desktop opens Google Maps in browser; mobile opens Google Maps app with walking mode.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User opens walking directions from selected marker
  Given the Offers map displays a business marker with active offers
  When the user selects that marker
  Then Google Maps shall open
  And the selected business location shall be preloaded
  And navigation mode shall be set to walking directions

Scenario: User opens walking directions from selected offer item
  Given the Offers list displays an offer with a location
  When the user selects the offer item for directions
  Then Google Maps shall open with the offer location preloaded
  And desktop clients shall open Google Maps in browser
  And mobile clients shall open Google Maps app in walking mode
```

## Example Inputs/Outputs
- Example input: Tap business marker at known coordinates.
- Expected output: External Google Maps deep link opens with walking route.
- Example input: Tap offer item destination action on desktop.
- Expected output: Browser opens Google Maps directions with walking mode.

## Edge Cases
- Location permission denied: map still shows business markers when available.
- Mobile Google Maps app unavailable: system falls back to browser walking directions.

## Non-Functional Constraints
- Map updates shall stay consistent with current offer filter state.

## Related Specs
- `OFFERS.SEARCH.001`
