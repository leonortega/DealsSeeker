# Spec: `OFFERS.LIST.ACTIONS.001`

## Metadata
- **Title**: Offer Item Action Buttons
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: Medium

## Purpose
Define required offer-level user feedback actions.

## Preconditions
- Offer item is visible in Offers list.
- User identity is available for vote uniqueness rules.

## Trigger
- Offer item action area is rendered.

## Requirements
- `OFFERS.LIST.ACTIONS.001-R1`: Each offer item shall include an `Available?` feedback label.
- `OFFERS.LIST.ACTIONS.001-R2`: Each offer item shall include a thumbs up icon action with a positive counter.
- `OFFERS.LIST.ACTIONS.001-R3`: Each offer item shall include a thumbs down icon action with a negative counter.
- `OFFERS.LIST.ACTIONS.001-R4`: Each offer item shall include a `Report` action button.
- `OFFERS.LIST.ACTIONS.001-R5`: The system shall allow each user to cast availability feedback only once per offer (thumbs up or thumbs down).
- `OFFERS.LIST.ACTIONS.001-R6`: When the current user already voted on an offer, both availability buttons shall remain visible and shall be disabled for that user.
- `OFFERS.LIST.ACTIONS.001-R7`: When the current user has not voted on an offer, both availability buttons shall be enabled.
- `OFFERS.LIST.ACTIONS.001-R8`: Selecting `Report` from an offer item shall navigate to the Reports view with the selected offer context attached.

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
```

## Example Inputs/Outputs
- Example input: Render offer item card.
- Expected output: Available? label, thumbs up and thumbs down actions with counters, and Report action are visible and selectable.
- Example input: Render offer card where current user already voted.
- Expected output: Thumbs buttons remain visible but disabled.
- Example input: Tap Report on a specific offer.
- Expected output: Reports view opens with prefilled report context for that offer.

## Edge Cases
- Counters unavailable due to network state should default to zero and remain visible.
- Action controls unavailable due to network state should still be visible with disabled state.
- Unauthenticated users should not be allowed to submit availability votes.

## Non-Functional Constraints
- Action labels shall remain readable on small mobile screens.

## Related Specs
- `OFFERS.LIST.ITEM.001`
- `REPORTS.OFFER.PREFILL.001`
