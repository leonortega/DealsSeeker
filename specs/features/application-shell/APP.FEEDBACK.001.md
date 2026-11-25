# Spec: `APP.FEEDBACK.001`

## Metadata
- **Title**: Transient Feedback Lifecycle
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Ensure user feedback messages do not remain on screen indefinitely after they have been read.

## Preconditions
- A view has displayed a status message for a user action.

## Trigger
- A status message is shown, replaced, or the view is left.

## Requirements
- `APP.FEEDBACK.001-R1`: A success or neutral status message shall be removed automatically after a short dwell without further user action.
- `APP.FEEDBACK.001-R2`: An error status message shall also be removed automatically, after a longer dwell than a success message.
- `APP.FEEDBACK.001-R3`: Showing a new status message shall replace the previous one and restart the dwell.
- `APP.FEEDBACK.001-R4`: Leaving the view shall clear any pending status message and cancel its timer.
- `APP.FEEDBACK.001-R5`: A message shall remain announced to assistive technology for as long as it is visible.
- `APP.FEEDBACK.001-R6`: Auto-dismissal shall not change the outcome of the action that produced the message.

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

Scenario: Leaving the view clears the feedback
  Given a status message is displayed
  When the user navigates away from the view
  Then no stale message shall remain when the view is opened again
```

## Example Inputs/Outputs
- Example input: favorite an offer, see "Favorite state updated."
- Expected output: the message disappears a few seconds later; the offer stays favorited.

## Edge Cases
- Rapid repeated actions producing several messages.
- Navigating away before the dwell elapses.
- Timers running while the app is backgrounded.
- Large text or localized messages wrapping to several lines.

## Non-Functional Constraints
- Auto-dismissal shall not remove an error before the longer dwell.
- No new dependency shall be added for the timer.

## Related Specs
- `APP.RESILIENCE.UX.001`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.UX.002`
