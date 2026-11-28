# Spec: `APP.RESILIENCE.UX.001`

## Metadata
- **Title**: Visible and recoverable failures that preserve user work
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Offers View (standard and immersive presentations)
- **Priority**: High

## Purpose
Ensure that a failed offers search or action is visible on the one status surface where the user is working, can be retried without leaving the view, and never costs the user work already entered.

## Preconditions
- User is in the Offers view.
- A search request has been issued.

## Trigger
- The offers search request fails or the device has no network connectivity.

## Requirements
- `APP.RESILIENCE.UX.001-R1`: When an offers search fails, the system shall display an error message in the active view, near the search controls, stating that the search failed and advising the user to check connectivity.
- `APP.RESILIENCE.UX.001-R2`: The error message shall be presented in both the standard Offers view and the immersive feed.
- `APP.RESILIENCE.UX.001-R3`: The error state shall provide a Retry action that re-runs the search with the current query, coverage radius, and favorites filter.
- `APP.RESILIENCE.UX.001-R4`: A successful search after a failure shall clear the error message.
- `APP.RESILIENCE.UX.001-R5`: The error message shall use plain language and shall not expose an internal status code as the primary message.
- `APP.RESILIENCE.UX.001-R6`: The error message and Retry label shall follow the active theme and localization.
- `APP.RESILIENCE.UX.001-R7`: Feedback about other failed actions, such as favorites or votes, shall remain distinct from the search-failure state.
- `APP.RESILIENCE.UX.001-R8`: A missing device position shall not be reported as a search failure; it shall be presented only as the no-position state defined in `APP.LOCATION.UNAVAILABLE.001`, and no location-bound search shall be retried until a position exists.
- `APP.RESILIENCE.UX.001-R9`: Error feedback shall be shown on the single status surface defined by `APP.POLISH.UX.001` and unified by `OFFERS.UX.002`, and shall not create a second competing error banner.
- `APP.RESILIENCE.UX.001-R10`: Recovery from an error, whether by retrying, editing the query or continuing with another action, shall preserve the user's query, coverage radius, filter, selected offer and any in-progress draft; no entered work shall be discarded because a request failed.
- `APP.RESILIENCE.UX.001-R11`: An error message shall be cleared once its condition is resolved, when the user leaves the view, or when its dwell ends, so that no expired error is left visible as an unread message.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Failed search shows an actionable error near the search controls
  Given the user is on the Offers view
  When the offers search request fails
  Then an error message is displayed near the search controls
  And the message states that the search failed and advises checking connectivity
  And a Retry action is available

Scenario: Retry re-runs the search and clears the error on success
  Given the search-failure error is displayed
  And the current query is "coffee" with a radius of 1500 meters
  When the user selects the Retry action
  Then a new search is executed with that query and radius
  And when the search succeeds the error message is cleared

Scenario: Immersive feed presents the search failure
  Given the immersive offers feed is active
  When the offers search request fails
  Then an error message and a Retry action are displayed in the feed

Scenario: Search failure message uses plain language
  Given the offers search request failed
  When the error message is displayed
  Then no internal status code is shown as the primary message

Scenario: Favorite failure does not display the search-failure state
  Given the offers search succeeded
  When changing a favorite fails
  Then a favorite-specific message is displayed
  And the search-failure error state is not displayed

Scenario: Missing position is not a search failure
  Given no usable device position can be obtained
  When discovery requires a location-bound search
  Then the no-position state of APP.LOCATION.UNAVAILABLE.001 is displayed
  And no search-failure error or Retry-search action is displayed
  And no location-bound search is retried without a position

Scenario: Errors use the single status surface
  Given an action in the Offers view has failed
  When the error feedback is displayed
  Then it appears on the same status surface used by other feedback
  And no second competing error banner is shown

Scenario: Recovery preserves user work
  Given the user has a query, radius, filter, selected offer and an in-progress draft
  When a request fails and the user retries or continues with another action
  Then the query, radius, filter, selected offer and draft are unchanged
  And nothing the user entered is discarded

Scenario: Expired error is cleared
  Given an error message is displayed
  When the condition is resolved, the user leaves the view, or the dwell ends
  Then the error message is no longer displayed
  And no expired error is left to be read
```

## Example Inputs/Outputs
- Example input: search request rejected due to offline device.
- Expected output: "Offers search failed." with hint "Check your connection and try again." and a "Retry" action.

## Edge Cases
- Failure while a previous successful result set is still visible.
- Repeated failures across multiple retries.
- Error message text expanded by localization.
- Dark theme active during the error state.
- A search failure occurs while the no-position state is active: the no-position state remains the only failure presentation until a position exists.
- A failed search while a report draft or Add Offer draft is open — the draft stays open and unchanged.
- Two failures in quick succession — only the most recent error message is shown.
- An error message that wraps to several lines still leaves the Retry action reachable.
- Returning to the view after the error's dwell has ended — no expired error is shown.

## Non-Functional Constraints
- The error state shall be visible without scrolling through the full offer list.
- Error recovery shall not trade the user's entered work for a faster retry.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `OFFERS.UX.002`
- `ADD.OFFER.UX.001`
- `APP.DRAFT.RECOVERY.001`
- `OFFERS.EMPTY.001`
- `APP.API.CONNECTIVITY.001`
- `APP.SEARCH.INTERACTION.001`
- `OFFERS.SEARCH.001`
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.UX.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.LOCATION.FALLBACK.001`
- `APP.LOCATION.UNAVAILABLE.001`
- `APP.LIFECYCLE.001`
