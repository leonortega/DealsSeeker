# Spec: `ADD.OFFER.LOCATION.001`

## Metadata
- **Title**: Add Offer Location Auto-Populate, Confirm, and Live Suggestions
- **Version**: `v1.4`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Define location lifecycle during add-offer flow.

## Preconditions
- User is on Add Offer view.

## Trigger
- Add Offer view opens, image selection completes, user presses `Confirm Location`/`Edit Location`, or user types into location input.

## Requirements
- `ADD.OFFER.LOCATION.001-R1`: When Add Offer view opens, the system shall auto-populate current location using GPS when available.
- `ADD.OFFER.LOCATION.001-R2`: `Confirm Location` shall confirm the currently selected location for the draft.
- `ADD.OFFER.LOCATION.001-R3`: The location text input shall provide business/address suggestion results while the user is typing.
- `ADD.OFFER.LOCATION.001-R4`: Suggestions shall start only when the input contains at least 3 characters.
- `ADD.OFFER.LOCATION.001-R5`: The Add Offer view shall not require a dedicated `Search Location` button to execute lookup.
- `ADD.OFFER.LOCATION.001-R6`: Selected suggestion result shall replace the current draft location.
- `ADD.OFFER.LOCATION.001-R7`: When the user selects a suggestion result, the location textbox value shall be set to the selected label.
- `ADD.OFFER.LOCATION.001-R8`: The Add Offer view shall display a mini map for location preview.
- `ADD.OFFER.LOCATION.001-R9`: The mini map shall show current selected location as a red point marker.
- `ADD.OFFER.LOCATION.001-R10`: Location suggestion provider shall be resolved from internal configuration.
- `ADD.OFFER.LOCATION.001-R11`: Supported provider modules for location lookup shall include Google Maps API and OpenLayers API.
- `ADD.OFFER.LOCATION.001-R12`: `Confirm Location` and `Edit Location` controls shall be displayed below the mini map.
- `ADD.OFFER.LOCATION.001-R13`: Initial control state shall be `Confirm Location` enabled and `Edit Location` disabled.
- `ADD.OFFER.LOCATION.001-R14`: After user confirms location, `Confirm Location` shall be disabled and `Edit Location` enabled.
- `ADD.OFFER.LOCATION.001-R15`: After user enters edit mode, `Edit Location` shall be disabled and `Confirm Location` enabled.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Auto-populate location when view opens
  Given the user opens Add Offer view
  When GPS location is available
  Then the draft location shall be auto-populated with current location
  And the location textbox value shall be set to current location label
  And the mini map shall show the current location as a red point

Scenario: Typeahead suggestions and replace selected location
  Given a location is currently selected in the draft
  And location search provider is resolved from internal configuration
  When the user types at least 3 characters for a business or address
  Then the lookup shall be performed through the configured provider module
  And suggestion results shall be displayed while typing
  When the user selects a suggestion result
  And the selected result location shall replace the current draft location
  And the location textbox value shall be updated to the selected suggestion label
  And the mini map shall display the selected location as a red point

Scenario: Confirm and edit toggle state
  Given the Add Offer location controls are visible
  Then Confirm Location shall be enabled
  And Edit Location shall be disabled
  When the user presses Confirm Location
  Then Confirm Location shall be disabled
  And Edit Location shall be enabled
  When the user presses Edit Location
  Then Edit Location shall be disabled
  And Confirm Location shall be enabled
```

## Example Inputs/Outputs
- Example input: Search text `Main Street Market`.
- Expected output: Draft location updated to selected result coordinates/address.

## Edge Cases
- Current location unavailable due to permission/state.
- Search returns no results.
- User confirms location without auto-populated value.

## Non-Functional Constraints
- Location state should remain consistent across view updates within the same draft.

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `ADD.OFFER.LAYOUT.001`
- `APP.CONFIG.MAPS.001`
