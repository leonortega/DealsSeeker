# Spec: `OFFERS.LIST.ACTIONS.001`

## Metadata
- **Title**: Offer Item Action Buttons
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: Medium

## Purpose
Define required offer-level user feedback actions.

## Preconditions
- Offer item is visible in Offers list.

## Trigger
- Offer item action area is rendered.

## Requirements
- `OFFERS.LIST.ACTIONS.001-R1`: Each offer item shall include an `Available?` feedback label.
- `OFFERS.LIST.ACTIONS.001-R2`: Each offer item shall include a thumbs up icon action with a positive counter.
- `OFFERS.LIST.ACTIONS.001-R3`: Each offer item shall include a thumbs down icon action with a negative counter.
- `OFFERS.LIST.ACTIONS.001-R4`: Each offer item shall include a `Report` action button.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offer item shows all required actions
  Given an offer item is displayed
  When the item action area is rendered
  Then the user shall see an Available? label
  And a thumbs up action with positive counter
  And a thumbs down action with negative counter
  And a Report action
```

## Example Inputs/Outputs
- Example input: Render offer item card.
- Expected output: Available? label, thumbs up and thumbs down actions with counters, and Report action are visible and selectable.

## Edge Cases
- Counters unavailable due to network state should default to zero and remain visible.
- Action controls unavailable due to network state should still be visible with disabled state.

## Non-Functional Constraints
- Action labels shall remain readable on small mobile screens.

## Related Specs
- `OFFERS.LIST.ITEM.001`
