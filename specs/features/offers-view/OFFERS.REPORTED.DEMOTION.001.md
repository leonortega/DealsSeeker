# Spec: `OFFERS.REPORTED.DEMOTION.001`

## Metadata
- **Title**: Reported Offer Demotion and Visual Flagging
- **Version**: `v0.1`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Reduce exposure of reported offers while still showing transparent moderation signals.

## Preconditions
- Offers include report status metadata.

## Trigger
- Main feed or search results are ranked and rendered.

## Requirements
- `OFFERS.REPORTED.DEMOTION.001-R1`: Reported offers shall be pushed to the bottom of the offer grid in main feed rendering.
- `OFFERS.REPORTED.DEMOTION.001-R2`: Reported offers shall be pushed to the bottom of search result rendering.
- `OFFERS.REPORTED.DEMOTION.001-R3`: Reported offers shall be visually flagged using a red border or red background indicator.
- `OFFERS.REPORTED.DEMOTION.001-R4`: Demotion shall be applied consistently after relevance and promotion ranking policies.
- `OFFERS.REPORTED.DEMOTION.001-R5`: Visual indicator shall remain visible in both light and dark themes.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Reported offers are demoted in main feed
  Given offers include reported and non-reported entries
  When the main Offers feed is rendered
  Then reported offers shall appear after non-reported offers
  And reported offers shall show a red visual indicator

Scenario: Reported offers are demoted in search results
  Given search returns reported and non-reported matches
  When results are ranked for display
  Then reported matches shall be placed below non-reported matches
  And reported matches shall remain visually flagged
```

## Example Inputs/Outputs
- Example input: Mixed result set with report flags.
- Expected output: Reported offers are grouped at the bottom with red styling.

## Edge Cases
- All results reported: order falls back to standard ranking within reported group.
- Conflicting flags default to safe demotion when report status is uncertain.

## Non-Functional Constraints
- Demotion and flagging should not noticeably delay feed rendering.

## Related Specs
- `OFFERS.FEED.PROMOTED.001`
- `OFFERS.SEARCH.SMART.001`
- `OFFERS.LIST.ACTIONS.001`
