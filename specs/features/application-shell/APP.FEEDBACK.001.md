# Spec: `APP.FEEDBACK.001`

## Metadata
- **Title**: Transient Feedback Lifecycle
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Ensure user feedback messages do not remain on screen indefinitely after they have been read, while allowing one reversible action to be undone within the message's dwell.

## Preconditions
- A view has displayed a status message for a user action.

## Trigger
- A status message is shown, replaced, or the view is left; an undo action on the message is selected.

## Requirements
- `APP.FEEDBACK.001-R1`: A success or neutral status message shall be removed automatically after a short dwell without further user action.
- `APP.FEEDBACK.001-R2`: An error status message shall also be removed automatically, after a longer dwell than a success message.
- `APP.FEEDBACK.001-R3`: Showing a new status message shall replace the previous one, restart the dwell, and retire any undo action attached to the previous message.
- `APP.FEEDBACK.001-R4`: Leaving the view shall clear any pending status message and cancel its timer; any deferred action attached to that message shall follow `OFFERS.ACTION.UNDO.001`.
- `APP.FEEDBACK.001-R5`: A message shall remain announced to assistive technology for as long as it is visible.
- `APP.FEEDBACK.001-R6`: Auto-dismissal shall not change the outcome of the action that produced the message.
- `APP.FEEDBACK.001-R7`: A success status message may expose at most one undo action for the action that produced it, available only within the same dwell as the message; activating undo shall restore the state that existed before that action.
- `APP.FEEDBACK.001-R8`: An undo action shall be announced with its message and shall not extend the message's dwell or require a separate dismissal step.
- `APP.FEEDBACK.001-R9`: The undo action shall disappear together with its message; when the dwell ends without undo, the outcome of the action shall stand, with any deferred action submitted as defined by `OFFERS.ACTION.UNDO.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Success feedback disappears on its own
  Given a user action produced a success message
  When the short dwell elapses without further input
  Then the message shall no longer be displayed

Scenario: Error feedback stays longer but still disappears
  Given a user action produced an error message
  When the short dwell elapses
  Then the message shall still be displayed
  When the longer dwell elapses
  Then the message shall no longer be displayed

Scenario: A new message replaces the previous one
  Given a status message is displayed
  When another action produces a new message
  Then only the new message shall be displayed
  And its dwell shall start from the beginning
  And any undo action on the previous message shall be retired

Scenario: Leaving the view clears the feedback
  Given a status message is displayed
  When the user navigates away from the view
  Then no stale message shall remain when the view is opened again

Scenario: Success feedback may offer one undo action
  Given a user action produced a success message for a reversible action
  When the message is displayed
  Then at most one undo action is presented with the message
  And the undo action is announced with the message
  And selecting it restores the state from before the action

Scenario: Undo disappears with its message
  Given a success message with an undo action is displayed
  When the short dwell elapses without the undo action being used
  Then neither the message nor the undo action is displayed
  And the action's outcome stands

Scenario: Error feedback does not offer undo
  Given a user action produced an error message
  When the message is displayed
  Then no undo action is presented with it
```

## Example Inputs/Outputs
- Example input: favorite an offer, see "Favorite state updated." with an `Undo` action.
- Expected output: selecting `Undo` restores the previous favorite state; otherwise the message and `Undo` disappear after the dwell and the offer stays favorited.

## Edge Cases
- Rapid repeated actions producing several messages — only the newest message and its own undo action remain.
- Navigating away before the dwell elapses — the message and undo action are cleared, and a deferred action is resolved per `OFFERS.ACTION.UNDO.001`.
- Timers running while the app is backgrounded.
- Large text or localized messages wrapping to several lines — the undo action stays within the same dwell.
- An action with no prior state to restore — no undo action is offered.

## Non-Functional Constraints
- Auto-dismissal shall not remove an error before the longer dwell.
- An undo action shall not outlive its message or extend the dwell.
- No new dependency shall be added for the timer.

## Related Specs
- `APP.RESILIENCE.UX.001`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.UX.002`
- `OFFERS.ACTION.UNDO.001`
- `OFFERS.LIST.ACTIONS.001`
