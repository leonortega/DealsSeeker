# Spec: `ADD.OFFER.SEQUENCED.001`

## Metadata
- **Title**: Sequenced Add Offer Flow with Visible Progress
- **Version**: `v2.1`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Break the contribution form into three named steps so a contributor sees only the step they are working on and always knows where they are and what remains, with step progress shown by a Material 3 progress indicator and step-level confirmations through a Material 3 dialog.

## Preconditions
- The user has opened Add Offer in create or edit mode.

## Trigger
- The Add Offer view renders, or the user moves between steps.

## Requirements
- `ADD.OFFER.SEQUENCED.001-R1`: The system shall present the contribution flow as three named steps in the fixed order `Photo`, `Place`, `Details`.
- `ADD.OFFER.SEQUENCED.001-R2`: The active step shall be indicated with visible progress that shows which step is active and how many steps remain.
- `ADD.OFFER.SEQUENCED.001-R3`: Only the active step's controls shall be presented in the view; controls belonging to another step shall not be visible or reachable, including by scrolling, until that step becomes active. Every required block of `ADD.OFFER.LAYOUT.001` shall still belong to its own step and be available there.
- `ADD.OFFER.SEQUENCED.001-R4`: The user shall move between steps through explicit `Next` and `Back` controls. Moving between steps shall not discard entered data, and data entered on a step shall survive that step becoming hidden and shall be restored when the step is shown again.
- `ADD.OFFER.SEQUENCED.001-R5`: The save action and field-level validation shall live on the final `Details` step, following `ADD.OFFER.UX.001`.
- `ADD.OFFER.SEQUENCED.001-R6`: In edit mode, all three steps shall start with the existing offer's data prefilled, and each step's prefilled values shall be restored when that step is revisited.
- `ADD.OFFER.SEQUENCED.001-R7`: Raw coordinate values shall not be shown in any step or in step progress feedback.
- `ADD.OFFER.SEQUENCED.001-R8`: The one-step-at-a-time behavior shall follow `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001`.
- `ADD.OFFER.SEQUENCED.001-R9`: Step progress shall be shown with a Material 3 progress indicator pattern that marks the active step and the number of remaining steps, preserving the information required by R2.
- `ADD.OFFER.SEQUENCED.001-R10`: A confirmation shown during the sequenced flow shall follow a Material 3 dialog pattern and shall not advance a step, close the view or discard data without an explicit user selection.
- `ADD.OFFER.SEQUENCED.001-R11`: The progress indicator and dialog patterns shall not change step order, one-step-at-a-time behavior, explicit `Next` and `Back` movement, data preservation, edit-mode prefill or coordinate privacy defined by R1–R8.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Three named steps with visible progress
  Given the user opens Add Offer in create mode
  When the view renders
  Then the progress shows Photo as active with two steps remaining
  And Place and Details are listed only as remaining steps

Scenario: Only the active step's controls are presented
  Given the user opens Add Offer in create mode
  When the Photo step is active
  Then the Photo controls are presented
  And no Place or Details control is present to scroll to

Scenario: Moving between steps preserves entered data
  Given the user attached a photo on the Photo step and entered a place on the Place step
  When the user moves forward to Details and then back to Photo
  Then the attached photo and the entered place are still present
  And the data entered on each hidden step is restored when that step is shown again

Scenario: Save and validation live on the Details step
  Given the user reached the Details step with a missing description
  When the user attempts to save
  Then the save action is available on that step
  And a validation message is attached to the description field
  And no save action is presented on an earlier step

Scenario: Edit mode prefills every step
  Given the user opens Add Offer in edit mode for a user-owned offer
  When each step becomes active in turn
  Then the existing photos, place and details are prefilled in their respective steps

Scenario: No raw coordinates in any step
  Given an offer location has been confirmed on the Place step
  When the user views any step
  Then no raw latitude or longitude values are shown

Scenario: Back on the first step keeps entered data
  Given the user is on the Photo step with a photo already attached
  When the user requests Back
  Then the existing cancel path is offered
  And the attached photo is not discarded

Scenario: Step progress uses a Material 3 progress indicator
  Given the user opens Add Offer in create mode
  When the view renders
  Then the active step and the number of remaining steps shall be shown by a Material 3 progress indicator
  And the fixed order Photo, Place, Details shall remain unchanged

Scenario: A step-level confirmation uses a Material 3 dialog
  Given a confirmation is shown during the sequenced flow
  When the dialog is displayed
  Then it shall remain until the user makes an explicit selection
  And no step shall advance and no entered data shall be discarded by the dialog alone

Scenario: Long localized step names keep the progress indicator readable
  Given step names are longer and the text scale is large
  When the view renders
  Then the progress indicator shall still show the active step and remaining count
  And only the active step's controls shall be presented
```

## Example Inputs/Outputs
- Example input: create mode, no data entered.
- Expected output: progress shows `Photo` active with two steps remaining, and only the Photo controls are present.
- Example input: user on Details goes back to Photo after entering a description.
- Expected output: the photo and place controls are restored with the data the user entered; the description is retained for return to Details.
- Example input: create mode with long localized step names.
- Expected output: a Material 3 progress indicator shows the active step and remaining count while only that step's controls appear.

## Edge Cases
- No camera capability — the Photo step still offers the gallery alternative, and no other step's controls appear there.
- Back is requested on the first step — the flow offers the existing cancel path without discarding entered data.
- Long localized step names at large text sizes — progress stays readable while only one step's controls are presented.
- A draft that cannot be loaded in edit mode — the recoverable error state from `ADD.OFFER.LAYOUT.001` is shown before any step is advanced.
- Returning to a step after its controls were hidden — all previously entered values are restored.
- A confirmation dialog appearing on the final step at large text size — it does not advance a step or hide entered values.

## Non-Functional Constraints
- The step indicator shall not replace the explicit completion controls defined by `ADD.OFFER.UX.001`.
- No fixed timer shall advance a step or close the view.
- A Material 3 confirmation dialog shall not introduce a timer-driven step advance or dismissal.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.UX.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `APP.PERFORMANCE.001`
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001`
- `ADD.OFFER.VISUAL.HIERARCHY.001`
