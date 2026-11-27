# Spec: `ADD.OFFER.SEQUENCED.001`

## Metadata
- **Title**: Sequenced Add Offer Flow with Visible Progress
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Break the contribution form into three named steps so a contributor always knows where they are and what remains.

## Preconditions
- The user has opened Add Offer in create or edit mode.

## Trigger
- The Add Offer view renders, or the user moves between steps.

## Requirements
- `ADD.OFFER.SEQUENCED.001-R1`: The system shall present the contribution flow as three named steps in the fixed order `Photo`, `Place`, `Details`.
- `ADD.OFFER.SEQUENCED.001-R2`: The active step shall be indicated with visible progress that shows which step is active and how many steps remain.
- `ADD.OFFER.SEQUENCED.001-R3`: Each step shall expose the controls relevant to that step, while keeping every required block of `ADD.OFFER.LAYOUT.001` available within its step.
- `ADD.OFFER.SEQUENCED.001-R4`: The user shall move between steps through explicit `Next` and `Back` controls, and moving between steps shall not discard entered data.
- `ADD.OFFER.SEQUENCED.001-R5`: The save action and field-level validation shall live on the final `Details` step, following `ADD.OFFER.UX.001`.
- `ADD.OFFER.SEQUENCED.001-R6`: In edit mode, all three steps shall start with the existing offer's data prefilled.
- `ADD.OFFER.SEQUENCED.001-R7`: Raw coordinate values shall not be shown in any step.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Three named steps with visible progress
  Given the user opens Add Offer in create mode
  When the view renders
  Then the steps Photo, Place and Details are shown in that order
  And the active step and the number of remaining steps are visible

Scenario: Moving between steps preserves entered data
  Given the user attached a photo on the Photo step and entered a place on the Place step
  When the user moves forward to Details and then back to Photo
  Then the attached photo and the entered place are still present

Scenario: Save and validation live on the Details step
  Given the user reached the Details step with a missing description
  When the user attempts to save
  Then the save action is available on that step
  And a validation message is attached to the description field

Scenario: Edit mode prefills every step
  Given the user opens Add Offer in edit mode for a user-owned offer
  When each step is rendered
  Then the existing photos, place and details are prefilled in their respective steps

Scenario: No raw coordinates in any step
  Given an offer location has been confirmed on the Place step
  When the user views any step
  Then no raw latitude or longitude values are shown
```

## Example Inputs/Outputs
- Example input: create mode, no data entered.
- Expected output: step indicator shows `Photo` active with two steps remaining.
- Example input: user on Details goes back to Photo after entering a description.
- Expected output: the description is retained when the user returns to Details.

## Edge Cases
- No camera capability — the Photo step still offers the gallery alternative.
- Back is requested on the first step — the flow does not lose entered data and offers the existing cancel path.
- Long localized step names at large text sizes.
- A draft that cannot be loaded in edit mode — the recoverable error state from `ADD.OFFER.LAYOUT.001` is shown before any step is advanced.

## Non-Functional Constraints
- The step indicator shall not replace the explicit completion controls defined by `ADD.OFFER.UX.001`.
- No fixed timer shall advance a step or close the view.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.UX.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `APP.PERFORMANCE.001`
