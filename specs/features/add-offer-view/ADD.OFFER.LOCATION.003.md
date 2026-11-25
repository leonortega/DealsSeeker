# Spec: `ADD.OFFER.LOCATION.003`

## Metadata
- **Title**: Accessible map pin placement
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Provide an accessible way to place or adjust the offer location pin without relying on a pointer gesture on the map.

## Preconditions
- The user is on the Add Offer view with the location section and mini map available.
- A draft location exists, either from device location, a search result, or a previously stored offer.

## Trigger
- The user needs to set or adjust the map pin for the draft.

## Requirements
- `ADD.OFFER.LOCATION.003-R1`: The location section shall expose a labelled action that sets the draft pin at the current map center.
- `ADD.OFFER.LOCATION.003-R2`: The accessible center-pin action shall produce the same draft location result as a direct map selection at that point.
- `ADD.OFFER.LOCATION.003-R3`: The available location shall be communicated as a human-readable label in the active language.
- `ADD.OFFER.LOCATION.003-R4`: Raw coordinate values shall not be presented as text in the location UI.
- `ADD.OFFER.LOCATION.003-R5`: The center-pin action shall be reachable and operable with assistive technology and with external keyboard or switch input where the platform provides them.
- `ADD.OFFER.LOCATION.003-R6`: Using the center-pin action shall not clear other draft content.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Set the pin at the map center without a pointer gesture
  Given the Add Offer mini map is displayed with a draft location
  When the user activates the set-pin-at-center action
  Then the draft location is set to the map center
  And the location label is updated to the resolved human-readable label

Scenario: Accessible action matches a direct map selection
  Given a point is displayed at the center of the mini map
  When the user activates the set-pin-at-center action
  Then the resulting draft location matches the location that a direct selection of that point would produce

Scenario: Coordinate privacy is preserved
  Given the user has set the pin through the accessible action
  When the location section is displayed
  Then no raw latitude or longitude value is shown as text
  And the draft still holds the coordinates needed for persistence

Scenario: Other draft content is preserved
  Given the draft already has a description and tags
  When the user adjusts the pin with the accessible action
  Then the description and tags remain unchanged
```

## Example Inputs/Outputs
- Example input: the mini map is centered on a resolved address label.
- Expected output: activating the accessible action confirms that address for the draft without showing numeric coordinates.

## Edge Cases
- Reverse geocoding of the map center returns no label.
- The map has not finished loading when the action is activated.
- The draft is in edit mode with a previously stored location.
- A localized label longer than the available space.

## Non-Functional Constraints
- The accessible action shall not require a pointer, hover, or fine motor gesture.

## Related Specs
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.LOCATION.002`
- `APP.LOCATION.QUERY.001`
- `APP.MAP.STACK.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `APP.CONFIG.MAPS.001`
- `APP.ADAPTIVE.UX.002`
