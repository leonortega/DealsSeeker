# Spec: `OFFERS.ACTION.UNDO.001`

## Metadata
- **Title**: One undo action for offer favorites and availability votes
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (list, feed and favorites rows) with Application Shell feedback
- **Priority**: Medium

## Purpose
Let a user reverse a just-completed favorite toggle or availability vote from the success feedback, while ensuring a vote that cannot be retracted is not submitted until the undo window has closed.

## Preconditions
- The user is authenticated and an offer is visible in the list, feed, or favorites.
- A favorite toggle or availability vote has just succeeded and produced a success status message on the existing feedback surface.
- The feedback surface follows `APP.FEEDBACK.001`.

## Trigger
- Success feedback for a favorite toggle or availability vote is shown; its undo action is selected; or its undo window closes.

## Requirements
- `OFFERS.ACTION.UNDO.001-R1`: A success message for a favorite toggle or an availability vote shall expose at most one undo action, for that single action.
- `OFFERS.ACTION.UNDO.001-R2`: The undo action shall be available only within the same dwell window as the status message and shall disappear together with that message.
- `OFFERS.ACTION.UNDO.001-R3`: The undo action shall be announced to assistive technology together with the message and shall be reachable without covering the action rail, the mode control, or the primary actions.
- `OFFERS.ACTION.UNDO.001-R4`: Selecting undo for a favorite toggle shall restore the favorite state that existed before the toggle and shall keep that state consistent with the saved-favorites set.
- `OFFERS.ACTION.UNDO.001-R5`: Selecting undo for an availability vote shall restore the counters and the user's vote state that existed before the vote, and no vote shall be submitted for that action.
- `OFFERS.ACTION.UNDO.001-R6`: Because a submitted vote cannot be retracted, submission of an availability vote shall be deferred until the undo window closes without undo; an undone vote shall never be submitted.
- `OFFERS.ACTION.UNDO.001-R7`: When the dwell ends, the message is replaced, or the view is left before undo is selected, the undo action shall be retired and any pending vote shall be submitted exactly once.
- `OFFERS.ACTION.UNDO.001-R8`: After an availability vote has been undone, the same user shall be able to cast a new vote on that offer; the undone vote shall not count as a prior vote and shall not produce a duplicate.
- `OFFERS.ACTION.UNDO.001-R9`: Undo shall not change the selected offer, the active query, or the filter, and shall not force navigation away from the current view.
- `OFFERS.ACTION.UNDO.001-R10`: The feedback and its undo action shall use the active language and theme.
- `OFFERS.ACTION.UNDO.001-R11`: Neither the feedback nor its undo action shall expose raw coordinate values.
- `OFFERS.ACTION.UNDO.001-R12`: No undo action shall be offered for an error message or for an action other than a favorite toggle or an availability vote.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Favorite toggle offers one undo in the status dwell
  Given an authenticated user sees an offer with no saved favorite state
  When the user toggles the favorite and the success status appears
  Then the status carries at most one Undo action for that toggle
  And the Undo action is announced with the status
  And the Undo action disappears when the status disappears

Scenario: Favorite undo restores the prior state
  Given a favorite toggle success status with an Undo action is displayed
  When the user selects Undo within the dwell
  Then the offer returns to its previous favorite state
  And that state is consistent with the saved-favorites set

Scenario: Vote undo defers submission until the window closes
  Given an authenticated user has not voted on an offer
  When the user casts a thumbs up vote and the optimistic counters update
  Then the success status carries one Undo action
  And no vote has been submitted while the undo window is open
  When the user selects Undo within the window
  Then the counters and the user's vote state are restored
  And no vote is submitted for that action

Scenario: Undo is announced and does not cover controls
  Given a reversible action status with an Undo action is displayed in the feed
  When assistive technology traverses the surface
  Then the Undo action is announced with the status
  And the action rail, mode control and primary actions remain tappable

Scenario: A user may vote again after undo without duplication
  Given a thumbs up vote was undone within its dwell
  When the same user casts a thumbs down vote on that offer
  Then the new vote is accepted
  And exactly one vote is recorded for that user and offer

Scenario: Undo expires with the dwell and the pending vote is submitted
  Given a vote success status with an Undo action is displayed
  When the dwell elapses without Undo being selected
  Then the status and the Undo action are no longer displayed
  And the pending vote is submitted exactly once

Scenario: A new message retires the old undo and commits a pending vote
  Given a vote success status with a pending Undo action is displayed
  When another action produces a new status message
  Then only the new message is displayed
  And the pending vote is submitted exactly once
  And no Undo action from the previous message remains

Scenario: Leaving the view commits a pending vote and clears undo
  Given a vote success status with a pending Undo action is displayed
  When the user navigates away before the dwell ends
  Then no stale status or Undo action remains
  And the pending vote is submitted exactly once

Scenario: No undo on errors or non-reversible actions
  Given an action failed or an action other than a favorite toggle or vote succeeded
  When the status message is displayed
  Then no Undo action is presented with it

Scenario: Undo feedback exposes no raw coordinates
  Given a reversible action status with an Undo action is displayed
  When the user reads the status and its Undo action
  Then no raw latitude or longitude values are shown
  And the selected offer and active filter are unchanged
```

## Example Inputs/Outputs
- Example input: user favorites an offer, then selects `Undo` before the message disappears.
- Expected output: the offer is no longer saved and the favorites set matches; the message and undo action disappear.
- Example input: user casts a thumbs up vote, then selects `Undo` before the dwell ends.
- Expected output: counters restore, no vote is submitted, and the user may still cast a vote on that offer.
- Example input: user casts a vote and does not select `Undo` before the dwell ends.
- Expected output: the vote is submitted exactly once and the undo action disappears with the status.

## Edge Cases
- The system has no facility to retract an already submitted availability vote — undo for a vote is optimistic-only and must be resolved before submission.
- The dwell ends while the app is backgrounded — pending vote is submitted once and no stale undo action is shown on return.
- The offer leaves the visible feed during the dwell — the pending vote is still submitted once unless undo was selected.
- Two reversible actions in quick succession — only the newest status has an undo action, and the earlier pending vote is submitted once.
- Unauthenticated user — no vote or favorite toggle is accepted, so no undo action is offered.
- Localized or large-text undo labels — the action remains tappable and does not cover the rail or primary actions.

## Non-Functional Constraints
- A submitted vote shall not be retracted; undo for a vote shall be completed before submission.
- The undo action shall not extend the status dwell or add a new row action.

## Related Specs
- `APP.FEEDBACK.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.UX.002`
- `OFFERS.FAVORITES.001`
- `APP.ACCESSIBILITY.UX.003`
