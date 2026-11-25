# Spec: `OFFERS.FEED.STABILITY.001`

## Metadata
- **Title**: Immersive Feed Position Stability
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Offers View (immersive presentation)
- **Priority**: High

## Purpose
Keep the immersive feed on the offer the user is viewing when an action refreshes the results.

## Preconditions
- The immersive offer feed is displayed.
- The user is viewing a specific offer page.

## Trigger
- An offer action (favorite or availability vote) completes and refreshes the result set.

## Requirements
- `OFFERS.FEED.STABILITY.001-R1`: After a result refresh, the feed shall remain on the same offer if that offer is still present in the results.
- `OFFERS.FEED.STABILITY.001-R2`: The feed shall not jump to another page or to the top as a side effect of favorite or vote actions.
- `OFFERS.FEED.STABILITY.001-R3`: If the active offer is no longer present, the feed shall remain at the closest valid position without a jarring reset.
- `OFFERS.FEED.STABILITY.001-R4`: Preserving the position shall not change action outcomes or result ordering.
- `OFFERS.FEED.STABILITY.001-R5`: The behavior shall hold at every supported text size and in both themes.
- `OFFERS.FEED.STABILITY.001-R6`: Favorite and vote actions shall apply their outcome to the locally displayed result set without a full result refresh, so no intermediate scroll shift occurs.
- `OFFERS.FEED.STABILITY.001-R7`: When a favorites-only filter is active and the offer is unfavorited, the system shall remove it from the displayed results.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Favorite keeps the current offer in view
  Given the immersive feed is on the second offer
  When the user favorites that offer
  And the refreshed results arrive
  Then the feed shall still display that offer
  And no visible scroll jump shall occur

Scenario: Vote keeps the current offer in view
  Given the immersive feed is on an offer
  When the user submits an availability vote
  And the refreshed results arrive
  Then the feed shall still display that offer

Scenario: Active offer removed from results
  Given the immersive feed is on an offer
  When a refresh removes that offer from the result set
  Then the feed shall display a valid offer without jumping to the top

Scenario: Action does not trigger an intermediate shift
  Given the immersive feed is on the second offer
  When the user favorites or votes on that offer
  Then the system shall update the displayed offer without a full search refresh
  And the feed shall not move at any point during the action

Scenario: Unfavoriting under the favorites filter removes the offer
  Given the favorites-only filter is active
  When the user unfavorites the displayed offer
  Then that offer shall no longer be displayed
```

## Example Inputs/Outputs
- Example input: on offer 2 of 5, tap favorite.
- Expected output: offer 2 stays on screen with its updated favorite state.

## Edge Cases
- Rapid favorite and vote on the same page.
- Refresh while a page scroll is still settling.
- Single-offer result set.
- Localized page heights at large text sizes.

## Non-Functional Constraints
- Position restoration shall not introduce visible animation.

## Related Specs
- `OFFERS.FEED.IMMERSIVE.001`
- `OFFERS.FAVORITES.001`
- `OFFERS.UX.002`
