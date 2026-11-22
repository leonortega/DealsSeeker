# Spec: `OFFERS.UX.002`

## Metadata
- **Title**: Visible action feedback in the immersive presentation
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Offers View (immersive presentation)
- **Priority**: High

## Purpose
Ensure that offer actions confirm their outcome where the user actually works, instead of silently setting a message that is never shown.

## Preconditions
- The user is in the immersive offers feed.
- An offer action (favorite, availability vote, report, comments, or directions) has been requested.

## Trigger
- An offer action completes, succeeds, or fails.

## Requirements
- `OFFERS.UX.002-R1`: When an offer action completes, the system shall present a plain-language confirmation or error in the active presentation.
- `OFFERS.UX.002-R2`: In the immersive presentation, the feedback shall be presented without leaving the feed or changing the selected offer.
- `OFFERS.UX.002-R3`: Failure feedback shall identify the problem and shall not discard the user's current filter, query, or selected offer.
- `OFFERS.UX.002-R4`: The feedback shall be announced to assistive technology.
- `OFFERS.UX.002-R5`: The feedback shall use the active language and theme.
- `OFFERS.UX.002-R6`: The feedback shall not block the action rail, the mode control, or the primary actions.
- `OFFERS.UX.002-R7`: Subsequent successful actions shall replace the previous feedback.
- `OFFERS.UX.002-R8`: The immersive offer action rail shall mark one primary action visually and keep maintenance actions visually secondary.

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
```

## Example Inputs/Outputs
- Example input: a vote request rejected because the user already voted.
- Expected output: a feed-local message stating "You already voted on this offer."; the feed stays on the same offer.

## Edge Cases
- Two actions complete in quick succession.
- Localized feedback longer than the source text.
- Large text scaling on a phone-sized screen.
- Feedback shown while the search error state panel is already visible.

## Non-Functional Constraints
- Feedback shall be transient and shall not require a separate dismissal action to continue using the feed.

## Related Specs
- `OFFERS.UX.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.FAVORITES.001`
- `APP.ACCESSIBILITY.UX.003`
