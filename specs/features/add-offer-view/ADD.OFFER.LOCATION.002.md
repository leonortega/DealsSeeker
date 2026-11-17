# Spec: `ADD.OFFER.LOCATION.002`

## Metadata
- **Title**: Add Offer Location Pin Selection on the Map
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Define how the user picks an address by pinning a point directly on the Add Offer mini map.

## Preconditions
- User is on Add Offer view (create or edit mode).
- The mini map is rendered with the configured map provider.

## Trigger
- The user taps a point on the mini map, or the map is opened without a resolved location.

## Requirements
- `ADD.OFFER.LOCATION.002-R1`: The Add Offer mini map shall accept a tap gesture and treat the tapped point as a location candidate.
- `ADD.OFFER.LOCATION.002-R2`: After a tap, a pin marker shall be shown at the tapped point and the draft location position shall be set to that point.
- `ADD.OFFER.LOCATION.002-R3`: The system shall resolve the human-readable address label for the tapped point and set the location textbox value to that label.
- `ADD.OFFER.LOCATION.002-R4`: The location source of a map-picked location shall be recorded as `map`.
- `ADD.OFFER.LOCATION.002-R5`: Raw coordinate values (`lat`, `lng`) shall not be displayed in the Add Offer UI for a map-picked location.
- `ADD.OFFER.LOCATION.002-R6`: A map-picked location shall require explicit confirmation before create-offer or edit-offer submission proceeds.
- `ADD.OFFER.LOCATION.002-R7`: If the address label cannot be resolved for the tapped point, the system shall keep the tapped point as the draft location and show a generic label that contains no numeric coordinates.
- `ADD.OFFER.LOCATION.002-R8`: Picking a point shall not move the map viewport away from the area the user is exploring.
- `ADD.OFFER.LOCATION.002-R9`: The mini map shall remain available for pin selection even when no location has been resolved yet.
- `ADD.OFFER.LOCATION.002-R10`: Pin selection shall be available in both create mode and edit mode.
- `ADD.OFFER.LOCATION.002-R11`: Pin selection shall work with whichever map provider is resolved from internal configuration.
- `ADD.OFFER.LOCATION.002-R12`: The coordinates of a map-picked location shall be persisted with the offer, like any other location source.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Pin a point on the mini map to set the address
  Given the Add Offer mini map is visible
  When the user taps a point on the map
  Then a pin marker shall be shown at the tapped point
  And the draft location position shall be the tapped point
  And the location textbox shall show the resolved address label for the tapped point
  And raw latitude/longitude values shall not be shown in the location UI

Scenario: Pinned location requires confirmation
  Given the user pinned a point on the map
  When the location was not confirmed yet
  Then Confirm Location shall be enabled
  And Edit Location shall be disabled
  When the user submits save
  Then the offer request shall not be sent

Scenario: Pinned location when the address label cannot be resolved
  Given the address lookup for the tapped point returns no label
  When the user taps a point on the map
  Then the draft location shall keep the tapped point
  And the location textbox shall show a generic label without numeric coordinates

Scenario: Pin selection is available before a location is resolved
  Given no location has been resolved for the draft
  Then the Add Offer mini map shall still be shown and shall accept pin selection

Scenario: Pin selection in edit mode
  Given the user opens Add Offer view in edit mode for a user-owned offer
  When the user taps a point on the mini map
  Then the draft location shall be replaced by the tapped point
  And the location textbox shall show the resolved address label for the tapped point
```

## Example Inputs/Outputs
- Example input: User taps the mini map at `40.7165, -74.0035`.
- Expected output: Location textbox shows the resolved address label only.
- Expected output: Draft location stores `source: "map"`, the label, and the tapped coordinates.

## Edge Cases
- The address lookup for the tapped point fails or returns no result.
- The user taps the map while an address lookup for the previous tap is still running.
- The user taps the map outside the visible map area or on an existing marker.
- The map provider is unavailable; pin selection shall not break the location section.
- The tapped point is picked while the location is already confirmed; confirmation shall be reset.

## Non-Functional Constraints
- Location state should remain consistent across view updates within the same draft.
- Pin selection shall not degrade the existing typeahead search or GPS auto-population flows.

## Related Specs
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.LAYOUT.001`
- `APP.CONFIG.MAPS.001`
- `APP.LOCATION.PROVIDER.RESILIENCE.001`
