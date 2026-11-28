# Spec: `ADD.OFFER.LOCATION.001`

## Metadata
- **Title**: Add Offer Location Auto-Populate, Confirm, and Live Suggestions
- **Version**: `v2.0`
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
- `ADD.OFFER.LOCATION.001-R10`: Location suggestions shall be served by Photon through the app API as defined by `APP.MAP.STACK.001`.
- `ADD.OFFER.LOCATION.001-R11`: No alternate geocoding provider shall be used for location suggestions or reverse geocoding.
- `ADD.OFFER.LOCATION.001-R12`: `Confirm Location` and `Edit Location` controls shall be displayed below the mini map.
- `ADD.OFFER.LOCATION.001-R13`: Initial control state shall be `Confirm Location` enabled and `Edit Location` disabled.
- `ADD.OFFER.LOCATION.001-R14`: After user confirms location, `Confirm Location` shall be disabled and `Edit Location` enabled.
- `ADD.OFFER.LOCATION.001-R15`: After user enters edit mode, `Edit Location` shall be disabled and `Confirm Location` enabled.
- `ADD.OFFER.LOCATION.001-R16`: On Add Offer view open, when GPS coordinates are available, the system shall make a single reverse-geocode request and display the nearest human-readable address label; further reverse lookups shall wait for a gesture as defined by `APP.LOCATION.QUERY.001`.
- `ADD.OFFER.LOCATION.001-R17`: Raw coordinate values (`lat`, `lng`) shall not be displayed to users in Add Offer location UI.
- `ADD.OFFER.LOCATION.001-R18`: Raw coordinate values (`lat`, `lng`) shall remain in draft data and be persisted to backend/database storage.
- `ADD.OFFER.LOCATION.001-R19`: If reverse-geocoding cannot resolve an address label, the UI shall show a generic location label without exposing numeric coordinates.
- `ADD.OFFER.LOCATION.001-R20`: The save action shall require the current location to be explicitly confirmed before create-offer or edit-offer submission proceeds.
- `ADD.OFFER.LOCATION.001-R21`: In edit mode, after the owned offer draft is loaded from backend storage, the mini map shall display the location persisted for that offer in the database.
- `ADD.OFFER.LOCATION.001-R22`: While a location lookup is in flight, the system shall show a searching indicator in the location section.
- `ADD.OFFER.LOCATION.001-R23`: When a lookup returns no results, the system shall show a no-results message in the location section.
- `ADD.OFFER.LOCATION.001-R24`: When a lookup fails, the system shall show an error with a retry path and shall leave the current draft location unchanged.
- `ADD.OFFER.LOCATION.001-R25`: A disabled `Confirm Location` or `Edit Location` control shall not be operable, and its disabled state shall be exposed to assistive technology.
- `ADD.OFFER.LOCATION.001-R26`: An offer submission without an explicit location shall be rejected with a plain-language validation error; the system shall not substitute a default coordinate or a location the user did not choose.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Auto-populate location when view opens
  Given the user opens Add Offer view
  When GPS location is available
  Then the draft location shall be auto-populated with current location
  And the location textbox value shall be set to the nearest resolved address label
  And raw latitude/longitude values shall not be shown in the location UI
  And the mini map shall show the current location as a red point

Scenario: Typeahead suggestions and replace selected location
  Given a location is currently selected in the draft
  When the user types at least 3 characters for a business or address
  Then the lookup shall be performed by Photon through the app API after a quiet period
  And suggestion results shall be displayed while typing
  When the user selects a suggestion result
  And the selected result location shall replace the current draft location
  And the location textbox value shall be updated to the selected suggestion label
  And the mini map shall display the selected location as a red point

Scenario: Coordinates are hidden in UI but persisted in draft
  Given the user has an auto-populated or selected location
  When the Add Offer location section is displayed
  Then raw latitude and longitude values shall not be visible in textbox or helper text
  And the draft payload shall still contain latitude and longitude values for persistence

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

Scenario: Save is blocked when location is not confirmed
  Given the draft has an auto-populated or selected location
  And the current location is not confirmed
  When the user submits save
  Then the system shall block submission
  And the system shall show a location-confirmation validation error

Scenario: Edit mode shows stored offer location on the mini map
  Given the user opens Add Offer view in edit mode for a user-owned offer
  And the owned offer has a persisted location in backend storage
  When the draft data finishes loading
  Then the location textbox shall show the stored location label
  And the mini map shall display the stored offer location from the database

Scenario: Searching and no-results states are visible
  Given the user typed at least 3 characters in the location input
  When the location lookup is in flight
  Then a searching indicator is shown in the location section
  When the lookup returns no results
  Then a no-results message is shown in the location section

Scenario: Search failure offers retry and keeps the draft location
  Given a location is selected for the draft
  When the location lookup fails
  Then an error with a retry path is shown
  And the current draft location is unchanged

Scenario: Disabled location controls are not operable
  Given Confirm Location has been pressed
  Then Confirm Location is disabled and not operable
  And Edit Location is enabled
  When assistive technology inspects Confirm Location
  Then its disabled state is announced
Scenario: Missing location is rejected without a substituted coordinate
  Given an offer submission has no location
  When the submission is validated
  Then it is rejected with a field-level location error
  And no fabricated coordinate is stored or displayed
```

## Example Inputs/Outputs
- Example input: Search text `Main Street Market`.
- Expected output: Location textbox shows selected/resolved address label only.
- Expected output: Draft location stores selected result coordinates and address label.

## Edge Cases
- Current location unavailable due to permission/state.
- A submission whose location is absent or null.
- Search returns no results.
- User confirms location without auto-populated value.
- Reverse-geocoding returns no address for GPS coordinates; UI shows fallback non-coordinate label.
- Auto-populated or selected location does not satisfy save validation until the user explicitly confirms it.
- In edit mode, the mini map shall wait for owned-offer draft data instead of showing an unrelated default location as the persisted preview.

## Non-Functional Constraints
- Location state should remain consistent across view updates within the same draft.

- `APP.VALIDATION.001`

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `ADD.OFFER.LOCATION.002`
- `ADD.OFFER.LOCATION.003`
- `ADD.OFFER.LAYOUT.001`
- `APP.MAP.STACK.001`
- `APP.LOCATION.QUERY.001`
- `APP.SEARCH.INTERACTION.001`
- `APP.CONFIG.MAPS.001`
- `APP.LOCATION.PROVIDER.RESILIENCE.001`
- `ADD.OFFER.UX.001`
- `ADD.OFFER.INPUT.BOUNDS.001`
