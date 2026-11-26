# Spec: `OFFERS.GRID.CARDS.001`

## Metadata
- **Title**: Compact Responsive Offer Grid Cards
- **Version**: `v0.3`
- **Status**: Approved
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
- `OFFERS.GRID.CARDS.001-R6`: On a narrow mobile viewport, the card's primary actions (favorite, directions, and comments) shall be stacked vertically with each action occupying the full card width, so localized labels wrap at word boundaries and do not break mid-word.

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

Scenario: Card actions stack on a narrow mobile viewport
  Given offers are available on a narrow mobile viewport
  And an offer has localized action labels longer than one word
  When the card is rendered
  Then the favorite, directions, and comments actions shall each occupy a full-width row
  And each label shall wrap at word boundaries without breaking mid-word
```

## Example Inputs/Outputs
- Example input: 20 offers rendered at `390px` and `820px` viewport widths.
- Expected output: A compact card grid that keeps consistent framing and readability while increasing the visible column count on the wider viewport.

## Edge Cases
- Very long descriptions truncate without overflowing card bounds.
- Missing image still keeps card layout intact with placeholder.
- Localized action labels containing long single words shall not overflow the full-width action rows.

## Non-Functional Constraints
- Grid scrolling should remain smooth under typical list sizes.

## Related Specs
- `APP.LIST.VIRTUALIZATION.001`
- `OFFERS.LAYOUT.001`
- `OFFERS.IMAGE.RENDERING.001`
- `OFFERS.FAVORITES.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ADAPTIVE.UX.001`
- `APP.CONTEXT_MENU.001`
