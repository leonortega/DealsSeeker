# Spec: `APP.NAVIGATION.MODE.001`

## Metadata
- **Title**: User-Selectable Directions Travel Mode
- **Version**: `v0.1`
- **Status**: Draft
- **Context/View**: Application Shell
- **Priority**: Medium

## Purpose
Allow the user to choose whether external directions should default to pedestrian or car navigation.

## Preconditions
- Application shell is available.
- A directions-capable action is available from an offer-related view.

## Trigger
- App startup, user change from settings, or user launch of directions from an offer.

## Requirements
- `APP.NAVIGATION.MODE.001-R1`: The system shall support at least `pedestrian` and `car` as selectable directions travel modes.
- `APP.NAVIGATION.MODE.001-R2`: The default directions travel mode shall be `pedestrian` when the user has not selected an override.
- `APP.NAVIGATION.MODE.001-R3`: The user shall be able to change the directions travel mode from user preferences.
- `APP.NAVIGATION.MODE.001-R4`: The selected directions travel mode shall persist per authenticated user account.
- `APP.NAVIGATION.MODE.001-R5`: Offer direction actions shall launch the external maps provider using the selected directions travel mode.
- `APP.NAVIGATION.MODE.001-R6`: Offer detail direction button text shall reflect the selected directions travel mode.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Default directions mode is pedestrian
  Given no manual directions mode override exists
  When the user opens an offer detail with directions available
  Then the direction action shall use pedestrian mode
  And the direction button text shall reflect pedestrian directions

Scenario: User changes directions mode to car
  Given the current directions mode is pedestrian
  When the user selects car mode in user preferences
  Then the selected directions mode shall persist for that user
  And offer direction actions shall use car mode
  And the offer detail direction button text shall reflect car directions
```

## Example Inputs/Outputs
- Example input: User changes directions mode from `pedestrian` to `car`.
- Expected output: Offer detail action text updates to car directions and external navigation opens in car mode.

## Edge Cases
- Missing or invalid stored directions mode falls back to `pedestrian`.
- Changing directions mode while an offer detail is open updates the visible direction action text without requiring app restart.

## Non-Functional Constraints
- Directions mode changes should apply without requiring app restart.

## Related Specs
- `OFFERS.MAP.001`
- `OFFERS.DETAIL.ACTIONS.001`
