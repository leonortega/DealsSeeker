# Spec: `OFFERS.GRID.CARDS.001`

## Metadata
- **Title**: Compact Square Offer Grid Cards
- **Version**: `v0.1`
- **Status**: Draft
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Redesign Offers grid using compact square cards with consistent sizing.

## Preconditions
- User is in Offers view with one or more offers.

## Trigger
- Offers feed/grid is rendered.

## Requirements
- `OFFERS.GRID.CARDS.001-R1`: The system shall render offers as small, uniform square cards.
- `OFFERS.GRID.CARDS.001-R2`: Cards shall maintain a consistent 1:1 aspect ratio across supported screen sizes.
- `OFFERS.GRID.CARDS.001-R3`: The grid shall be responsive and adjust columns by viewport width.
- `OFFERS.GRID.CARDS.001-R4`: Card content shall remain readable in compact form without breaking layout.
- `OFFERS.GRID.CARDS.001-R5`: Card actions and state indicators required by related specs shall remain visible in the compact card layout.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offers render as compact square cards
  Given the user is on Offers view
  When the offer grid is displayed
  Then each offer tile shall render as a square card
  And card dimensions shall remain visually consistent across the grid

Scenario: Grid adapts to screen size
  Given offers are available
  When the user switches between small and large screen widths
  Then card aspect ratio shall remain square
  And the number of columns shall adjust responsively
```

## Example Inputs/Outputs
- Example input: 20 offers on a mobile viewport.
- Expected output: Responsive square-card grid with consistent tile proportions.

## Edge Cases
- Very long descriptions truncate without overflowing card bounds.
- Missing image still keeps card dimensions intact with placeholder.

## Non-Functional Constraints
- Grid scrolling should remain smooth under typical list sizes.

## Related Specs
- `OFFERS.LAYOUT.001`
- `OFFERS.IMAGE.RENDERING.001`
- `OFFERS.FAVORITES.001`
