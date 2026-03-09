# Spec: `ADD.OFFER.LAYOUT.001`

## Metadata
- **Title**: Add Offer View Layout Composition
- **Version**: `v1.9`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Define required UI blocks for add-offer data entry in both create and edit modes.

## Preconditions
- User has navigated to Add Offer view.

## Trigger
- Add Offer view renders.

## Requirements
- `ADD.OFFER.LAYOUT.001-R1`: The system shall display an image upload area with a photo icon and preview support.
- `ADD.OFFER.LAYOUT.001-R2`: The system shall display a description input field.
- `ADD.OFFER.LAYOUT.001-R3`: The system shall display a tag management section with the current tag list and a suggested tags subsection.
- `ADD.OFFER.LAYOUT.001-R4`: The system shall display location information.
- `ADD.OFFER.LAYOUT.001-R5`: The system shall display `Confirm Location` action and a location search input with live suggestions.
- `ADD.OFFER.LAYOUT.001-R6`: The system shall display a mini map location preview in Add Offer view.
- `ADD.OFFER.LAYOUT.001-R7`: `Confirm Location` and `Edit Location` actions shall be positioned below the mini map.
- `ADD.OFFER.LAYOUT.001-R8`: After a successful create-offer response (no errors), the system shall redirect to `Offers` view.
- `ADD.OFFER.LAYOUT.001-R9`: The Add Offer view shall support an edit mode for an existing user-owned offer.
- `ADD.OFFER.LAYOUT.001-R10`: In edit mode, the primary view title shall be `Edit Offer`.
- `ADD.OFFER.LAYOUT.001-R11`: In edit mode, the system shall prefill the existing offer description, tags, images, and location before the user saves changes.
- `ADD.OFFER.LAYOUT.001-R12`: After a successful edit-offer response (no errors), the system shall redirect to `My Account` view.
- `ADD.OFFER.LAYOUT.001-R13`: The save action shall validate required offer content before submitting the create-offer or edit-offer request.
- `ADD.OFFER.LAYOUT.001-R14`: When required offer content is missing, the system shall block submission and show a validation error state in Add Offer view.
- `ADD.OFFER.LAYOUT.001-R15`: In edit mode, the mini map preview shall render the persisted offer location from backend storage after the owned-offer draft is loaded.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Add Offer view displays required controls
  Given the user opens Add Offer view
  When the view loads
  Then image upload area, description, current tag list, suggested tags section, and location info shall be visible
  And a location search input with live suggestions shall be visible
  And a mini map location preview shall be visible
  And Confirm Location and Edit Location actions shall be visible below the mini map

Scenario: Successful add-offer submission redirects to Offers
  Given the user is in Add Offer view with valid offer data
  When the user submits create offer
  And the create-offer response is successful with no errors
  Then the system shall redirect the user to Offers view

Scenario: Edit Offer view loads existing offer data
  Given the user opens Add Offer view in edit mode for a user-owned offer
  When the view loads
  Then the view title shall be `Edit Offer`
  And the existing description, selected tags, images, and location shall be prefilled
  And the mini map shall show the persisted offer location

Scenario: Successful edit-offer submission redirects to My Account
  Given the user is in Edit Offer view with valid updated offer data
  When the user submits edit offer
  And the edit-offer response is successful with no errors
  Then the system shall redirect the user to My Account view

Scenario: Add Offer submission is blocked when required content is missing
  Given the user is in Add Offer view
  And at least one of photo, description, selected tag, or confirmed location is missing
  When the user submits create offer
  Then the system shall not send the create-offer request
  And the system shall show a validation error state
```

## Example Inputs/Outputs
- Example input: Enter Add Offer view.
- Expected output: Full required layout blocks rendered.

## Edge Cases
- No camera capability still shows upload area and alternative gallery path.
- If the target owned offer cannot be loaded for edit, the system shall show a recoverable error state and not submit changes.
- Required-content validation applies in both create mode and edit mode before save.

## Non-Functional Constraints
- Layout remains usable on mobile portrait screens.

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
- `ACCOUNT.PROFILE.001`
