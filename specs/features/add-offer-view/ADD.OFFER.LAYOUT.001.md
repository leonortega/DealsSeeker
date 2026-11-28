# Spec: `ADD.OFFER.LAYOUT.001`

## Metadata
- **Title**: Add Offer View Layout Composition
- **Version**: `v2.5`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Define required UI blocks for add-offer data entry in both create and edit modes, grouped into named steps.

## Preconditions
- User has navigated to Add Offer view.

## Trigger
- Add Offer view renders.

## Requirements
- `ADD.OFFER.LAYOUT.001-R1`: The system shall display an image upload area with a photo icon and preview support.
- `ADD.OFFER.LAYOUT.001-R2`: The system shall display a description input field.
- `ADD.OFFER.LAYOUT.001-R3`: The system shall display a tag management section with detected words and the current tag list.
- `ADD.OFFER.LAYOUT.001-R4`: The system shall display location information.
- `ADD.OFFER.LAYOUT.001-R5`: The system shall display `Confirm Location` action and a location search input with live suggestions.
- `ADD.OFFER.LAYOUT.001-R6`: The system shall display a mini map location preview in Add Offer view.
- `ADD.OFFER.LAYOUT.001-R7`: `Confirm Location` and `Edit Location` actions shall be positioned below the mini map.
- `ADD.OFFER.LAYOUT.001-R8`: After a successful create-offer response (no errors), the system shall show explicit `View offer` and `Done` controls and shall not redirect until one of them is selected, following `ADD.OFFER.UX.001`.
- `ADD.OFFER.LAYOUT.001-R9`: The Add Offer view shall support an edit mode for an existing user-owned offer.
- `ADD.OFFER.LAYOUT.001-R10`: In edit mode, the primary view title shall be `Edit Offer`.
- `ADD.OFFER.LAYOUT.001-R11`: In edit mode, the system shall prefill the existing offer description, tags, images, and location before the user saves changes.
- `ADD.OFFER.LAYOUT.001-R12`: After a successful edit-offer response (no errors), the system shall show explicit `View offer` and `Done` controls and shall not redirect until one of them is selected, following `ADD.OFFER.UX.001`.
- `ADD.OFFER.LAYOUT.001-R13`: The save action shall validate required offer content before submitting the create-offer or edit-offer request.
- `ADD.OFFER.LAYOUT.001-R14`: When required offer content is missing, the system shall block submission and show a validation error state in Add Offer view.
- `ADD.OFFER.LAYOUT.001-R15`: In edit mode, the mini map preview shall render the persisted offer location from backend storage after the owned-offer draft is loaded.
- `ADD.OFFER.LAYOUT.001-R16`: The tag section shall display a short hint that tapping a selected tag removes it. Related tags shall appear as opt-in suggestions with an explicit acceptance control, and no note shall state that related tags are added automatically, following `ADD.OFFER.TAGS.SUGGESTIONS.001`. No word-detection guidance text shall be displayed above the detected words.
- `ADD.OFFER.LAYOUT.001-R17`: In edit mode, when the owned offer draft cannot be loaded, the system shall show a recoverable error state that blocks submission and offers `Retry` and `Cancel` actions.
- `ADD.OFFER.LAYOUT.001-R18`: The view shall expose an explicit `Cancel` action following `ADD.OFFER.EXIT.001`.
- `ADD.OFFER.LAYOUT.001-R19`: The view shall offer a contextual help affordance that opens the same help surface with the contributing-an-offer topic first, as defined in `APP.HELP.CONTEXTUAL.001`, without leaving Add Offer, discarding the in-progress draft, or exposing raw coordinates.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Add Offer view displays required controls
  Given the user opens Add Offer view
  When the view loads
  Then image upload area, description, detected words, current tag list, and location info shall be visible
  And the required blocks are grouped into the Photo, Place and Details steps
  And a location search input with live suggestions shall be visible
  And a mini map location preview shall be visible
  And Confirm Location and Edit Location actions shall be visible below the mini map

Scenario: Successful add-offer submission waits for explicit completion
  Given the user is in Add Offer view with valid offer data
  When the user submits create offer
  And the create-offer response is successful with no errors
  Then View offer and Done controls are shown
  And no redirect occurs until one of them is selected

Scenario: Edit Offer view loads existing offer data
  Given the user opens Add Offer view in edit mode for a user-owned offer
  When the view loads
  Then the view title shall be `Edit Offer`
  And the existing description, selected tags, images, and location shall be prefilled
  And the mini map shall show the persisted offer location

Scenario: Successful edit-offer submission waits for explicit completion
  Given the user is in Edit Offer view with valid updated offer data
  When the user submits edit offer
  And the edit-offer response is successful with no errors
  Then View offer and Done controls are shown
  And no redirect occurs until one of them is selected

Scenario: Add Offer submission is blocked when required content is missing
  Given the user is in Add Offer view
  And at least one of photo, description, selected tag, or confirmed location is missing
  When the user submits create offer
  Then the system shall not send the create-offer request
  And the system shall show a validation error state

Scenario: Tag section shows removal hint and opt-in suggestions
  Given the user opens Add Offer view
  When the tag section loads with description-derived tags
  Then a hint shall state that tapping a selected tag removes it
  And related tags shall be offered with an explicit acceptance control
  And no note shall state that related tags are added automatically
  And no word-detection guidance text shall be displayed

Scenario: Edit draft load failure blocks submission
  Given the user opens Add Offer view in edit mode for a user-owned offer
  And the owned offer draft cannot be loaded
  When the load attempt fails
  Then a recoverable error state is shown
  And submission is blocked
  And Retry and Cancel actions are offered

Scenario: Explicit cancel action is present
  Given the user opens Add Offer view
  Then an explicit Cancel action is visible

Scenario: Contextual help opens from Add Offer
  Given the user is in Add Offer with a draft in progress
  When the user selects its contextual help affordance
  Then the same help surface opens with contributing an offer shown first
  And the user remains in Add Offer with the draft unchanged
  And no raw coordinate value is displayed
  And dismissing help returns focus to the affordance
```

## Example Inputs/Outputs
- Example input: Enter Add Offer view.
- Expected output: Full required layout blocks rendered.

## Edge Cases
- No camera capability still shows upload area and alternative gallery path.
- If the target owned offer cannot be loaded for edit, the system shall show a recoverable error state and not submit changes.
- Required-content validation applies in both create mode and edit mode before save.
- Contextual help opened while a draft is in progress leaves the draft unchanged on dismissal.

## Non-Functional Constraints
- Layout remains usable on mobile portrait screens.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `ADD.OFFER.SEQUENCED.001`
- `APP.PERFORMANCE.001`
- `ADD.OFFER.IMAGE.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
- `ACCOUNT.PROFILE.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `ADD.OFFER.LOCATION.003`
- `APP.POLISH.UX.001`
- `ADD.OFFER.UX.001`
- `ADD.OFFER.EXIT.001`
- `ADD.OFFER.KEYBOARD.001`
- `ADD.OFFER.ICONOGRAPHY.001`
- `ADD.OFFER.INPUT.BOUNDS.001`
- `ADD.OFFER.VISUAL.HIERARCHY.001`
- `ADD.OFFER.TABLET.LAYOUT.001`
- `APP.HELP.CONTEXTUAL.001`
- `APP.HELP.001`
