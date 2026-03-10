# Spec: `OFFERS.GRID.CARDS.001`

## Metadata
- **Title**: Compact Responsive Offer Grid Cards
- **Version**: `v0.2`
- **Status**: Draft
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Define a compact responsive offer-card layout with consistent visual structure and readable actions.

## Preconditions
- User is in Offers view with one or more offers.

## Trigger
- Offers feed/grid is rendered.

## Requirements
- `OFFERS.GRID.CARDS.001-R1`: The system shall render offers as compact, visually consistent cards in a responsive grid.
- `OFFERS.GRID.CARDS.001-R2`: Cards shall keep a consistent visual structure across supported screen sizes, including a stable image frame and content section.
- `OFFERS.GRID.CARDS.001-R3`: The grid shall be responsive and adjust columns by viewport width.
- `OFFERS.GRID.CARDS.001-R4`: Card content shall remain readable in compact form without breaking layout.
- `OFFERS.GRID.CARDS.001-R5`: Card actions and state indicators required by related specs shall remain visible in the compact card layout.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offers render as compact responsive cards
  Given the user is on Offers view
  When the offer grid is displayed
  Then each offer tile shall render as a compact card with consistent structure
  And the image frame and content layout shall remain visually consistent across the grid

Scenario: Grid adapts to screen size
  Given offers are available
  When the user switches between small and large screen widths
  Then card image framing shall remain visually consistent
  And the number of columns shall adjust responsively
```

## Example Inputs/Outputs
- Example input: 20 offers on a mobile viewport.
- Expected output: Responsive compact-card grid with consistent image framing and readable content/action areas.

## Edge Cases
- Very long descriptions truncate without overflowing card bounds.
- Missing image still keeps card layout intact with placeholder.

## Non-Functional Constraints
- Grid scrolling should remain smooth under typical list sizes.

## Related Specs
- `OFFERS.LAYOUT.001`
- `OFFERS.IMAGE.RENDERING.001`
- `OFFERS.FAVORITES.001`
