# Spec: `OFFERS.LIST.ACTIONS.001`

## Metadata
- **Title**: Offer Item Actions with a Shared Vocabulary
- **Version**: `v1.4`
- **Status**: Approved
- **Context/View**: Offers View (list, feed and favorites rows)
- **Priority**: Medium

## Purpose
Define required offer-level feedback actions using the same vocabulary on every row surface, with one undo action available for a just-completed favorite toggle or availability vote.

## Preconditions
- Offer item is visible in Offers list.
- User identity is available for vote uniqueness rules.

## Trigger
- Offer item action area is rendered, or a favorite toggle or availability vote completes with success feedback.

## Requirements
- `OFFERS.LIST.ACTIONS.001-R1`: Each offer item shall include an `Available?` feedback label.
- `OFFERS.LIST.ACTIONS.001-R2`: Each offer item shall include a thumbs up icon action with a positive counter.
- `OFFERS.LIST.ACTIONS.001-R3`: Each offer item shall include a thumbs down icon action with a negative counter.
- `OFFERS.LIST.ACTIONS.001-R4`: Each offer item shall include a `Report` action button.
- `OFFERS.LIST.ACTIONS.001-R5`: The system shall allow each user to cast availability feedback only once per offer (thumbs up or thumbs down).
- `OFFERS.LIST.ACTIONS.001-R6`: When the current user already voted on an offer, both availability buttons shall remain visible and shall be disabled for that user.
- `OFFERS.LIST.ACTIONS.001-R7`: When the current user has not voted on an offer, both availability buttons shall be enabled.
- `OFFERS.LIST.ACTIONS.001-R8`: Selecting `Report` from an offer item shall open the Reports view with the selected offer context attached, and this transition shall be initiated by the user's selection.
- `OFFERS.LIST.ACTIONS.001-R9`: Offer cards, feed rows and favorites rows shall render actions using the canonical vocabulary defined by `OFFERS.ACTIONS.LABELS.001` — the same label, glyph and relative order on every surface.
- `OFFERS.LIST.ACTIONS.001-R10`: At most four actions shall be visible at once on an offer row; any remaining actions shall sit behind a single control visibly labelled `More`.
- `OFFERS.LIST.ACTIONS.001-R11`: Completing an inline action on an offer row shall not by itself force navigation away from the current view or close the offer; any transition shall be initiated by an explicit user control.
- `OFFERS.LIST.ACTIONS.001-R12`: A successful availability vote shall be confirmed on the existing status surface with at most one `Undo` action for that vote, within the same dwell as the status message, following `APP.FEEDBACK.001` and `OFFERS.ACTION.UNDO.001`.
- `OFFERS.LIST.ACTIONS.001-R13`: Because a submitted vote cannot be retracted, vote submission shall be deferred until the undo window closes; selecting `Undo` within that window shall leave no recorded vote and shall restore the prior counter and vote state.
- `OFFERS.LIST.ACTIONS.001-R14`: After an availability vote has been undone, the same user shall be able to vote again on that offer; the undone vote shall not count as a prior vote or produce a duplicate.
- `OFFERS.LIST.ACTIONS.001-R15`: A favorite toggle performed on an offer row may expose the same single `Undo` action on the status surface, and selecting it shall restore the favorite state that existed before the toggle.
- `OFFERS.LIST.ACTIONS.001-R16`: The status message and its undo action shall not add a fifth visible row action and shall not expose raw coordinate values.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offer item shows all required actions
  Given an offer item is displayed
  When the item action area is rendered
  Then the user shall see an Available? label
  And a thumbs up action with positive counter
  And a thumbs down action with negative counter
  And a Report action

Scenario: User can vote only once per offer
  Given a user has already voted thumbs up on an offer
  When the same user tries to vote again on the same offer
  Then the second availability vote shall be rejected
  And counters shall not change due to the rejected vote

Scenario: Buttons are disabled when user already voted
  Given the current user already voted on an offer
  When the offer item action area is rendered
  Then thumbs up and thumbs down buttons shall be visible
  And both availability buttons shall be disabled for that user

Scenario: Buttons are enabled when user has not voted
  Given the current user has not voted on an offer
  When the offer item action area is rendered
  Then thumbs up and thumbs down buttons shall be visible
  And both availability buttons shall be enabled for that user

Scenario: Report action opens Reports view with offer context
  Given an offer item is displayed in Offers list
  When the user selects Report on that offer item
  Then the Reports view shall open
  And selected offer context shall be available for report prefill

Scenario: Row actions match the canonical vocabulary
  Given the same offer appears in the list, in the feed and in favorites
  When each row's action area is rendered
  Then the same labels, glyphs and relative order are used on every surface
  And any overflow sits behind a single control labelled More

Scenario: Inline action does not force navigation
  Given an offer row is displayed in the feed
  When the user completes an inline availability vote
  Then the feed stays on the current destination
  And the row remains visible until the user explicitly navigates or closes it

Scenario: Vote success offers one undo within the status dwell
  Given an authenticated user has not voted on an offer row
  When the user casts a thumbs up vote and it succeeds
  Then a status message is shown with at most one Undo action
  And the counters reflect the optimistic vote

Scenario: Vote undo leaves no recorded vote
  Given a thumbs up vote is shown with an Undo action
  When the user selects Undo before the dwell ends
  Then the counters and the user's vote state are restored
  And no vote is submitted for that action

Scenario: A user may vote again after undo
  Given a thumbs up vote was undone within its dwell
  When the same user casts a thumbs down vote on that offer
  Then the new vote is accepted
  And no duplicate vote is recorded

Scenario: Favorite toggle can be undone from the row
  Given an authenticated user toggles a favorite from an offer row
  When the success status is shown
  Then at most one Undo action is presented on the status surface
  And selecting it restores the prior favorite state

Scenario: Undo does not add a row action or expose coordinates
  Given an offer row has a successful vote status with an Undo action
  When the row and status surface are rendered
  Then the row still shows at most four actions
  And no raw latitude or longitude values are displayed
```

## Example Inputs/Outputs
- Example input: Render offer item card.
- Expected output: Available? label, thumbs up and thumbs down actions with counters, and Report action are visible and selectable.
- Example input: Render offer card where current user already voted.
- Expected output: Thumbs buttons remain visible but disabled.
- Example input: Tap Report on a specific offer.
- Expected output: Reports view opens with prefilled report context for that offer.
- Example input: The same offer shown in list, feed and favorites with six available actions.
- Expected output: identical labels, glyphs and order, with four visible actions and a labelled `More` control.
- Example input: thumbs up vote succeeds, then the user selects `Undo` before the dwell ends.
- Expected output: counters return to their prior values, no vote is recorded, and the user may vote again.

## Edge Cases
- Counters unavailable due to network state should default to zero and remain visible.
- Action controls unavailable due to network state should still be visible with disabled state.
- Unauthenticated users should not be allowed to submit availability votes and receive no undo action.
- A row with fewer than four actions — no `More` control is shown.
- A reported offer row — the report action stays available and the row does not navigate on its own.
- The dwell ends or the user leaves the view before vote undo — the pending vote is submitted exactly once and the undo action is retired.
- Two actions complete in quick succession — only the newest status and its own undo action remain.

## Non-Functional Constraints
- Action labels shall remain readable on small mobile screens.
- Undo shall live on the status surface and shall not alter the canonical row vocabulary.

## Related Specs
- `OFFERS.LIST.ITEM.001`
- `OFFERS.FEED.RESPONSIVE.001`
- `REPORTS.OFFER.PREFILL.001`
- `OFFERS.COMMENTS.001`
- `APP.ACCESSIBILITY.UX.002`
- `OFFERS.UX.002`
- `APP.HAPTICS.001`
- `APP.PERFORMANCE.001`
- `OFFERS.ACTIONS.LABELS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `APP.FEEDBACK.001`
- `OFFERS.ACTION.UNDO.001`
- `OFFERS.FAVORITES.001`
