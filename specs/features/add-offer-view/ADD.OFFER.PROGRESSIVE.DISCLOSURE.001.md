# Spec: `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001`

## Metadata
- **Title**: One-step-at-a-time progressive disclosure in Add Offer
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Present only the current contribution step so a contributor never has to skip or scroll past sections that do not apply yet.

## Preconditions
- The user has opened Add Offer in create or edit mode.
- The contribution is organized into the fixed steps `Photo`, `Place`, `Details` defined by `ADD.OFFER.SEQUENCED.001`.

## Trigger
- The Add Offer view renders, or the user moves to another step.

## Requirements
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R1`: The system shall present exactly one contribution step at a time.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R2`: Controls and content belonging to an inactive step shall not be part of the view, so the user does not encounter another step's section by scrolling the active step.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R3`: The system shall keep the fixed order `Photo`, `Place`, `Details` and shall show which step is active and how many steps remain.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R4`: The user shall advance with an explicit `Next` control and return with an explicit `Back` control; no step shall change on a timer or on scroll.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R5`: Data entered on a step shall be retained while that step is inactive and shall be restored when the user returns to it, in both create and edit modes.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R6`: The save action and field-level validation shall be presented only on the final `Details` step.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R7`: In edit mode, each step shall restore the existing offer's values for that step when it becomes active, including steps the user has not visited yet.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R8`: No step, progress indicator, or transition feedback shall expose raw coordinate values.
- `ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R9`: The `Next` and `Back` controls and the step indicator shall remain available on every step without becoming part of another step's content.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Only the active step is presented
  Given the user opens Add Offer in create mode
  When the Photo step is active
  Then only the Photo controls are presented
  And no Place or Details section is present for the user to scroll to
  And the progress shows Photo as active with two steps remaining

Scenario: Advancing reveals the next step only
  Given the Photo step is active with a photo attached
  When the user selects Next
  Then the Place controls are presented
  And the Photo controls are no longer part of the view
  And no Details section is present for the user to scroll to

Scenario: Data survives steps that are hidden
  Given the user entered a photo, a place and a description across the three steps
  When the user moves from Details back to Photo and forward to Details again
  Then the photo, place and description are restored on their respective steps
  And no entered value is discarded while its step is inactive

Scenario: Progress and explicit navigation remain available
  Given the user is on the Place step
  When the user reviews the step controls
  Then the progress identifies Place as active and one step as remaining
  And Next and Back are both available

Scenario: Save and validation belong only to Details
  Given the user is on the Place step with a missing description
  When the user reviews the available actions
  Then no save action is presented
  When the user reaches Details and attempts to save
  Then a validation message is attached to the description field

Scenario: Edit mode restores values of a not-yet-visited step
  Given the user opens Add Offer in edit mode for a user-owned offer
  When only the Photo step has been shown so far
  Then the saved place and details are restored when those steps later become active

Scenario: No raw coordinates on any step
  Given an offer location has been confirmed on the Place step
  When the user moves through Photo, Place and Details
  Then no raw latitude or longitude values are shown

Scenario: Back on the first step offers the existing cancel path
  Given the user is on the Photo step with an attached photo
  When the user selects Back
  Then the existing cancel path is offered
  And the attached photo is retained if the user stays
```

## Example Inputs/Outputs
- Example input: create mode, no data entered.
- Expected output: only the Photo controls are present; progress shows Photo active with two steps remaining.
- Example input: user on Details goes back to Photo and forward again.
- Expected output: place and description values are restored when their steps are shown; no other step's section appears while Photo is active.

## Edge Cases
- Long localized step names at large text sizes — progress stays readable without exposing another step's controls.
- A draft that cannot be loaded in edit mode — the recoverable error state from `ADD.OFFER.LAYOUT.001` is shown before the first step is advanced.
- No camera capability — the Photo step offers the gallery alternative and no other step's controls.
- Rapid repeated Next and Back selections — the active step remains unambiguous and entered data is not lost.
- A step with no data entered yet — returning to it shows the empty controls for that step only.

## Non-Functional Constraints
- Replacing a step's content shall not require the user to re-enter data from a previous step.
- No timer shall advance a step or remove the user's entered data.
- The active step and progress shall be perceivable with assistive technology.

## Related Specs
- `ADD.OFFER.SEQUENCED.001`
- `ADD.OFFER.VISUAL.HIERARCHY.001`
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.UX.001`
- `ADD.OFFER.EXIT.001`
