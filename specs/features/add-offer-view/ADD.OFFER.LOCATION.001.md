# Spec: `ADD.OFFER.LOCATION.001`

## Metadata
- **Title**: Add Offer Location Auto-Populate, Confirm, and Search
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Define location lifecycle during add-offer flow.

## Preconditions
- User is on Add Offer view.
- User has selected an image for the draft.

## Trigger
- Image selection completes, or user presses `Confirm Location` / `Search Location`.

## Requirements
- `ADD.OFFER.LOCATION.001-R1`: After image selection, the system shall auto-populate user current location.
- `ADD.OFFER.LOCATION.001-R2`: `Confirm Location` shall confirm the currently selected location for the draft.
- `ADD.OFFER.LOCATION.001-R3`: `Search Location` shall allow searching for business or address by text.
- `ADD.OFFER.LOCATION.001-R4`: Selected search result shall replace the current draft location.
- `ADD.OFFER.LOCATION.001-R5`: `Search Location` shall use Google Maps API for text-based business or address lookup.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Auto-populate location after image selection
  Given the user selected an image in Add Offer view
  When image selection is completed
  Then the draft location shall be auto-populated with current location

Scenario: Search and replace selected location
  Given a location is currently selected in the draft
  When the user searches for a business and selects a result
  Then the lookup shall be performed through Google Maps API
  And the selected result location shall replace the current draft location
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
