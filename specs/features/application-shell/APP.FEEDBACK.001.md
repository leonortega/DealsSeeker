# Spec: `APP.FEEDBACK.001`

## Metadata
- **Title**: Feedback Lifecycle: Pending, Outcome, Persistence and Undo
- **Version**: `v1.3`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Make every mutation visibly pending before it resolves to one clear outcome, keep transient messages from lingering, support messages that stay until dismissed, and let every reversible action be undone, all through one non-interrupting Material 3 snackbar-pattern status surface.

## Preconditions
- A view is about to perform, is performing, or has completed a user-initiated mutation.
- A status message may be displayed for that mutation.

## Trigger
- A mutation starts, succeeds or fails; a status message is shown, replaced or dismissed; the view is left; an undo or dismiss action is selected.

## Requirements
- `APP.FEEDBACK.001-R1`: A transient success or neutral status message shall be removed automatically after a short dwell without further user action.
- `APP.FEEDBACK.001-R2`: A transient error status message shall also be removed automatically, after a longer dwell than a success message.
- `APP.FEEDBACK.001-R3`: Showing a new transient status message shall replace the previous transient one, restart the dwell, and retire any undo action attached to the previous message.
- `APP.FEEDBACK.001-R4`: Leaving the view shall clear any pending status message and cancel its timer; any deferred action attached to that message shall follow `OFFERS.ACTION.UNDO.001`.
- `APP.FEEDBACK.001-R5`: A message shall remain announced to assistive technology for as long as it is visible.
- `APP.FEEDBACK.001-R6`: Auto-dismissal shall not change the outcome of the action that produced the message.
- `APP.FEEDBACK.001-R7`: A success status message may expose at most one undo action for the action that produced it, available only within the same dwell as the message; activating undo shall restore the state that existed before that action.
- `APP.FEEDBACK.001-R8`: An undo action shall be announced with its message and shall not extend the message's dwell or require a separate dismissal step.
- `APP.FEEDBACK.001-R9`: The undo action shall disappear together with its message; when the dwell ends without undo, the outcome of the action shall stand, with any deferred action submitted as defined by `OFFERS.ACTION.UNDO.001`.
- `APP.FEEDBACK.001-R10`: Every user-initiated mutation shall show a pending indication from the moment it starts until its outcome is known, and that indication shall be visible and announced to assistive technology.
- `APP.FEEDBACK.001-R11`: Each mutation shall resolve to exactly one terminal status message, either success or failure; a failure shall be described in plain language and shall not be presented as a success.
- `APP.FEEDBACK.001-R12`: A status message may be designated persistent; a persistent message shall remain visible until the user explicitly dismisses it, shall not auto-dismiss, and shall carry a visible, labelled dismiss control.
- `APP.FEEDBACK.001-R13`: A persistent message shall not be removed by a later transient message; a new persistent message shall replace the previous persistent message, and leaving the view shall clear all messages as defined by R4.
- `APP.FEEDBACK.001-R14`: Every reversible action shall expose one undo action on its success message, as defined by its owning spec (`OFFERS.ACTION.UNDO.001` for favorite toggles and availability votes, `OFFERS.FAVORITES.001` for removing a favorite in My Favorites); an action whose prior state cannot be restored shall not offer undo.
- `APP.FEEDBACK.001-R15`: The unified status surface shall follow a Material 3 snackbar pattern: a non-interrupting message that appears in the current view without blocking it or taking focus, showing the message and at most one action together on that one surface.
- `APP.FEEDBACK.001-R16`: A transient status message shall use the temporary form of that pattern and shall auto-dismiss after the dwell defined by R1 and R2; a persistent status message shall use the persistent-until-action form and shall remain until the user dismisses it or acts on it, as defined by R12 and R13.
- `APP.FEEDBACK.001-R17`: Adopting the Material 3 snackbar pattern shall not change undo availability, dwell durations, message replacement, announcement, pending indication or terminal-outcome behavior defined by R1–R14.

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

Scenario: Every mutation shows pending then one outcome
  Given a user action is about to mutate saved data
  When the action starts
  Then a pending indication shall be visible and announced to assistive technology
  When the action succeeds or fails
  Then exactly one terminal status message shall be shown
  And no pending indication shall remain

Scenario: Failure is described plainly and never as success
  Given a mutation has failed
  When its status message is shown
  Then the message shall describe the failure in plain language
  And the message shall not be presented as a success

Scenario: A persistent message stays until it is dismissed
  Given a status message is designated persistent
  When the short dwell and the longer dwell elapse
  Then the message shall still be displayed
  And a visible, labelled dismiss control shall be available
  When the user selects dismiss
  Then the message shall no longer be displayed

Scenario: A transient message does not remove a persistent message
  Given a persistent message is displayed
  When another action produces a transient message
  Then the persistent message shall remain displayed
  And the transient message shall follow its own dwell

Scenario: Every reversible action offers undo
  Given an action whose prior state can be restored has succeeded
  When its success message is shown
  Then one undo action shall be presented with the message
  And selecting it shall restore the prior state

Scenario: An irreversible action offers no undo
  Given an action whose prior state cannot be restored has succeeded
  When its success message is shown
  Then no undo action shall be presented with it

Scenario: Status messages follow a non-interrupting snackbar pattern
  Given a user action is about to produce a status message
  When the message is displayed on the unified status surface
  Then it shall follow a Material 3 snackbar pattern that does not block the current view or take focus
  And its message and any single action shall be presented together on the one surface

Scenario: The snackbar pattern keeps temporary and persistent forms distinct
  Given a transient message and a persistent message are both specified
  When each is displayed on the unified status surface
  Then the transient message shall auto-dismiss after its own dwell
  And the persistent message shall remain until the user dismisses it or acts on it
  And the undo behavior and dwell rules shall be unchanged

Scenario: A long localized snackbar message with an action stays on one surface
  Given a status message wraps to several lines and carries one undo action
  When it is displayed on the unified status surface
  Then the message and the undo action shall remain together on that one surface
  And the current view shall stay interactive and the message shall stay announced
```

## Example Inputs/Outputs
- Example input: favorite an offer, see "Favorite state updated." with an `Undo` action.
- Expected output: selecting `Undo` restores the previous favorite state; otherwise the message and `Undo` disappear after the dwell and the offer stays favorited.
- Example input: a save request is still in flight.
- Expected output: a pending indication is visible and announced; when the request resolves, exactly one success or failure message replaces it.
- Example input: a persistent message is displayed and a different action succeeds.
- Expected output: the persistent message stays until dismissed, and the new transient message follows its own dwell.
- Example input: a localized success message with one undo action displayed on the unified status surface.
- Expected output: a single non-interrupting Material 3 snackbar-pattern message carrying the undo action; the underlying view stays interactive and the dwell and undo rules are unchanged.

## Edge Cases
- Rapid repeated actions producing several messages — only the newest message and its own undo action remain.
- Navigating away before the dwell elapses — the message and undo action are cleared, and a deferred action is resolved per `OFFERS.ACTION.UNDO.001`.
- Timers running while the app is backgrounded.
- Large text or localized messages wrapping to several lines — the undo action stays within the same dwell.
- An action with no prior state to restore — no undo action is offered.
- A mutation that fails after its pending indication — the failure message appears plainly and no undo action is offered.
- A persistent message with several transient messages in quick succession — the persistent message remains until explicitly dismissed.
- Leaving the view while a persistent message is displayed — no message remains when the view is reopened.
- Localized dismiss and undo labels at 200 percent text size.
- A localized message wrapping to several lines with an undo action — both stay on the one snackbar-pattern surface and the view remains interactive.

## Non-Functional Constraints
- A pending indication shall be shown before any mutation outcome is displayed.
- Auto-dismissal shall not remove a non-persistent error before the longer dwell.
- An undo action shall not outlive its message or extend the dwell.
- No new dependency shall be added for the timer.
- The status-surface pattern shall not add a second surface or a blocking modal for transient feedback.

## Related Specs
- `APP.PLATFORM.CHROME.001`
- `APP.POLISH.UX.001`
- `APP.RESILIENCE.UX.001`
- `APP.ACCESSIBILITY.UX.003`
- `OFFERS.UX.002`
- `OFFERS.ACTION.UNDO.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.FAVORITES.001`
- `REPORTS.SUBMIT.001`
