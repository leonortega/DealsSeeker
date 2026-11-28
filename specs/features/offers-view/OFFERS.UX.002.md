# Spec: `OFFERS.UX.002`

## Metadata
- **Title**: Unified and non-stale action feedback across presentations
- **Version**: `v1.4`
- **Status**: Approved
- **Context/View**: Offers View (immersive presentation)
- **Priority**: High

## Purpose
Ensure that offer actions confirm their outcome where the user actually works, with one undo action available for a just-completed favorite or vote, using one non-interrupting Material 3 snackbar-pattern status surface in both presentations, never leaving an expired message on screen, and never discarding the user's work.

## Preconditions
- The user is in the immersive offers feed.
- An offer action (favorite, availability vote, report, comments, or directions) has been requested.

## Trigger
- An offer action completes, succeeds, or fails; its undo action is selected or its dwell ends.

## Requirements
- `OFFERS.UX.002-R1`: When an offer action completes, the system shall present a plain-language confirmation or error in the active presentation.
- `OFFERS.UX.002-R2`: In the immersive presentation, the feedback shall be presented without leaving the feed or changing the selected offer.
- `OFFERS.UX.002-R3`: Failure feedback shall identify the problem and shall not discard the user's current filter, query, or selected offer.
- `OFFERS.UX.002-R4`: The feedback shall be announced to assistive technology.
- `OFFERS.UX.002-R5`: The feedback shall use the active language and theme.
- `OFFERS.UX.002-R6`: The feedback shall not block the action rail, the mode control, or the primary actions.
- `OFFERS.UX.002-R7`: Subsequent successful actions shall replace the previous feedback.
- `OFFERS.UX.002-R8`: The immersive offer action rail shall mark one primary action visually and keep maintenance actions visually secondary.
- `OFFERS.UX.002-R9`: A success confirmation for a favorite toggle or an availability vote may expose at most one `Undo` action on the same feedback surface, for the same dwell as the confirmation, following `APP.FEEDBACK.001` and `OFFERS.ACTION.UNDO.001`.
- `OFFERS.UX.002-R10`: The `Undo` action shall be announced together with the feedback and shall remain tappable without covering the action rail, the mode control, or the primary actions.
- `OFFERS.UX.002-R11`: For an availability vote, `Undo` shall leave no recorded vote because submission is deferred until the undo window closes; a later vote by the same user shall be accepted as their first vote.
- `OFFERS.UX.002-R12`: Feedback and its undo action shall not expose raw coordinate values.
- `OFFERS.UX.002-R13`: The same status surface, placement and wording pattern shall be used for equivalent actions in the standard and immersive presentations, so that feedback does not change shape with the presentation mode.
- `OFFERS.UX.002-R14`: A status message shall not be left visible once it is inaccurate or once the user has moved away from the offer or view it described; an expired message shall be cleared rather than remain as an unread message.
- `OFFERS.UX.002-R15`: Presenting, replacing or clearing feedback shall preserve the user's query, coverage radius, filter, selected offer, any open report draft, and scroll position.
- `OFFERS.UX.002-R16`: Feedback shall appear on the single status surface defined by `APP.POLISH.UX.001` and shall not stack with a search-failure or empty-state panel.
- `OFFERS.UX.002-R17`: The single status surface shall follow a Material 3 snackbar pattern in both the standard and immersive presentations: non-interrupting, with a temporary form for transient feedback and a persistent-until-action form for feedback that waits for a user action.
- `OFFERS.UX.002-R18`: The snackbar pattern shall not change R1–R16 behavior: undo availability and dwell, control reachability, work preservation, coordinate privacy and the single-surface placement shall remain as specified.

## Acceptance Criteria (BDD)
```gherkin
Scenario: A successful vote is confirmed in the feed
  Given the immersive offers feed is active
  When the user submits an availability vote and the request succeeds
  Then a confirmation is displayed in the feed
  And the selected offer is unchanged

Scenario: A failed action explains the problem in the feed
  Given the immersive offers feed is active
  When a favorite or vote request fails
  Then an error message is displayed in the feed
  And the active query and filter remain unchanged

Scenario: Feedback is announced and does not cover controls
  Given action feedback is displayed in the feed
  When assistive technology traverses the surface
  Then the feedback is announced
  And the action rail and the mode control remain tappable

Scenario: New feedback replaces the previous feedback
  Given a confirmation is displayed after a successful action
  When the user performs another action that fails
  Then the error message replaces the earlier confirmation

Scenario: A reversible action offers one undo in the feed
  Given the immersive offers feed is active
  When a favorite toggle or availability vote succeeds
  Then the confirmation carries at most one Undo action for that action
  And the Undo action is announced with the confirmation
  And the action rail and mode control remain tappable

Scenario: Vote undo defers submission and permits a later vote
  Given a vote confirmation with an Undo action is displayed
  When the user selects Undo within the dwell
  And the same user later casts a vote on the same offer
  Then no vote was recorded for the undone action
  And the later vote is accepted once

Scenario: Undo feedback stays within the offer and hides coordinates
  Given a reversible action confirmation is displayed in the feed
  When the user reads the confirmation and its Undo action
  Then the selected offer and the active filter are unchanged
  And no raw latitude or longitude values are shown

Scenario: Both presentations use the same feedback surface
  Given the same offer action is available in the standard and immersive presentations
  When the action succeeds in each presentation
  Then the confirmation uses the same status surface and placement in both
  And its wording follows the same plain-language pattern

Scenario: Stale feedback is cleared when the user moves on
  Given a confirmation is displayed for the currently selected offer
  When the user selects a different offer or leaves the Offers view
  Then the earlier confirmation is no longer displayed
  And no expired message is left to be read

Scenario: Feedback preserves the user's work context
  Given the user has an active query, filter, selected offer and a partially written report
  When an offer action produces feedback
  Then the query, filter, selected offer and report draft are unchanged
  And the scroll position is unchanged

Scenario: Feedback does not stack with another status panel
  Given a search-failure error panel is displayed
  When an offer action produces feedback
  Then only the single status surface carries the new feedback
  And the search-failure state is unchanged or replaced, not duplicated

Scenario: Action feedback follows the snackbar pattern in both presentations
  Given the same offer action is available in the standard and immersive presentations
  When the action produces feedback
  Then the feedback shall appear on one non-interrupting Material 3 snackbar-pattern status surface in both presentations
  And the action rail, mode control and primary actions shall remain tappable

Scenario: Temporary and persistent snackbar forms keep their behavior
  Given an offer action produces transient feedback and another produces feedback that waits for an action
  When each is displayed on the status surface
  Then the transient feedback shall follow its dwell
  And the waiting feedback shall remain until the user acts or dismisses it
  And undo behavior and work preservation shall be unchanged

Scenario: Long localized feedback and undo fit one snackbar surface
  Given feedback wraps to several lines and carries one undo action
  When it is displayed in the immersive presentation
  Then the message and undo action shall remain on the one status surface
  And no raw coordinate value shall be shown
```

## Example Inputs/Outputs
- Example input: a vote request rejected because the user already voted.
- Expected output: a feed-local message stating "You already voted on this offer."; the feed stays on the same offer and no undo action is shown.
- Example input: a vote succeeds and the user selects the single `Undo` action.
- Expected output: counters return to their prior values, nothing is submitted, and the feed stays on the same offer.

## Edge Cases
- Two actions complete in quick succession — only the newest confirmation and its own undo action are present.
- Localized feedback longer than the source text.
- Large text scaling on a phone-sized screen — the undo action stays reachable without covering controls.
- Feedback shown while the search error state panel is already visible.
- Error feedback and non-reversible actions — no undo action is offered.
- A confirmation about an offer that is reported or voted on again after the message appeared — the new state wins and the older message is not left behind.
- Feedback arriving while a report draft is open in the feed — the draft stays open and unchanged.
- Localized long feedback text — it wraps within the one status surface instead of creating a second one.
- A very small viewport where the undo action and the status text must share one surface.
- A localized confirmation longer than the source text with an undo action — the message and undo stay on one snackbar-pattern surface and controls remain tappable.

## Non-Functional Constraints
- Feedback shall be transient and shall not require a separate dismissal action to continue using the feed.
- An undo action shall not outlive its confirmation or change the selected offer.
- Unifying feedback across presentations shall not remove the undo affordance or weaken its accessibility.
- The snackbar pattern shall not add a second feedback surface or obscure the action rail or mode control.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `APP.RESILIENCE.UX.001`
- `APP.DRAFT.RECOVERY.001`
- `OFFERS.ACTIONS.LABELS.001`
- `OFFERS.UX.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.FAVORITES.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.FEEDBACK.001`
- `OFFERS.ACTION.UNDO.001`
