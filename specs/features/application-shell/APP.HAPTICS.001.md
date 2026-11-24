# Spec: `APP.HAPTICS.001`

## Metadata
- **Title**: Native Haptic Feedback for Confirmed Actions
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, Offers, Suggestions, Reports
- **Priority**: Low

## Purpose
Add brief native haptic confirmation for a small set of successful user actions, delegating the actual feedback to the operating system without changing the brand UI.

## Preconditions
- The application runs on iOS or Android.
- The user has performed an action that the application has confirmed as successful.

## Trigger
- A favorite toggle, availability vote, suggestion submission or report submission completes successfully.

## Requirements
- `APP.HAPTICS.001-R1`: The system shall emit one brief native haptic confirmation when a favorite is toggled successfully.
- `APP.HAPTICS.001-R2`: The system shall emit one brief native haptic confirmation when an availability vote is registered successfully.
- `APP.HAPTICS.001-R3`: The system shall emit one brief success haptic when a suggestion or report is submitted successfully.
- `APP.HAPTICS.001-R4`: No haptic shall be emitted for a failed action, a validation error or a cancelled operation.
- `APP.HAPTICS.001-R5`: Haptic feedback shall be behavior-only; it shall not add, remove or restyle any visible control or message.
- `APP.HAPTICS.001-R6`: The operating system's haptic capability and user settings shall govern whether feedback is perceivable; the application shall not attempt to override them.
- `APP.HAPTICS.001-R7`: Haptic feedback shall not delay, block or replace the visible status feedback for the action.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Successful favorite toggle confirms by touch
  Given the user is authenticated and viewing an offer
  When the favorite toggle succeeds
  Then one brief native haptic confirmation shall be emitted
  And the visible favorite state shall update as defined by its own spec

Scenario: Successful vote confirms by touch
  Given the user submits an availability vote
  When the vote is registered successfully
  Then one brief native haptic confirmation shall be emitted
  And the visible status message shall remain unchanged

Scenario: Successful contribution confirms by touch
  Given the user submits a valid suggestion or report
  When the submission succeeds
  Then one success haptic shall be emitted
  And the success message and subsequent navigation shall remain as specified

Scenario: Failure produces no haptic
  Given an action fails or fails validation
  When the failure message is shown
  Then no haptic confirmation shall be emitted

Scenario: Haptics do not alter the visual system
  Given haptic feedback is available on the device
  When it is emitted
  Then no control, palette, spacing or copy shall change

Scenario: Platform without haptic support
  Given the device does not support haptic feedback
  When a confirmed action completes
  Then the action and its visible feedback shall complete normally
```

## Example Inputs/Outputs
- Example input: user favorites an offer and the request succeeds.
- Expected output: one brief haptic pulse; the favorite icon and status message update as before.
- Example input: user submits a report but the message is blank.
- Expected output: validation message shown; no haptic.

## Edge Cases
- An action succeeds while the screen is in the background — no additional haptic beyond the OS default.
- Two confirmed actions occur in quick succession — each emits at most one haptic.
- The OS setting disables haptics — the app does not attempt to re-enable them.
- A localized status message is longer than the source text — haptics are unaffected.

## Non-Functional Constraints
- Haptic calls shall be fire-and-forget and shall not block the action's result.
- Any haptic library shall be used only for OS behavior; no visual component library shall be added.

## Related Specs
- `APP.SHELL.002`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.FAVORITES.001`
- `OFFERS.LIST.ACTIONS.001`
- `SUGGESTIONS.SUBMIT.001`
- `REPORTS.SUBMIT.001`
- `APP.CONTEXT_MENU.001`
