# Spec: `OFFERS.GRID.CARDS.001`

## Metadata
- **Title**: Compact Responsive Offer Grid Cards
- **Version**: `v0.5`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Material 3 card defaults (Android phase)
The brand-only shadow and pill-shape exceptions are retired. Offer cards shall use Material 3 card defaults for shape, elevation and color while keeping the structure, readability, action reachability and narrow-viewport stacking defined by this spec.

## Purpose
Define a compact responsive offer-card layout with consistent visual structure and readable actions, using a Material 3 card pattern without changing structure or action behavior.

## Preconditions
- User is in Offers view with one or more offers.

## Trigger
- Offers feed/grid is rendered.

## Requirements
- `OFFERS.GRID.CARDS.001-R1`: The system shall render offers as compact, visually consistent cards in a responsive grid.
- `OFFERS.GRID.CARDS.001-R2`: Cards shall keep a consistent visual structure across supported screen sizes, including a stable image frame and content section.
- `OFFERS.GRID.CARDS.001-R3`: The grid shall be responsive and adjust columns by viewport width.
- `OFFERS.GRID.CARDS.001-R4`: Card content shall remain readable in compact form without breaking layout.
- `OFFERS.GRID.CARDS.001-R5`: Card actions and state indicators required by related specs shall remain reachable in the compact card layout; the three primary actions (favorite, directions, comments) stay visible and availability voting and reporting sit behind one visibly labelled disclosure.
- `OFFERS.GRID.CARDS.001-R6`: On a narrow mobile viewport, the card's primary actions (favorite, directions, and comments) shall be stacked vertically with each action occupying the full card width, so localized labels wrap at word boundaries and do not break mid-word.
- `OFFERS.GRID.CARDS.001-R7`: Each offer tile shall follow a Material 3 card pattern with an image area and a content area, keeping the consistent structure, readability, action reachability and narrow-viewport stacking defined by R1–R6.
- `OFFERS.GRID.CARDS.001-R8`: State indicators and compact action controls shall follow Material 3 indicator and button patterns without changing their names, roles, states or reachability on any viewport.
- `OFFERS.GRID.CARDS.001-R9`: Offer cards shall use Material 3 card defaults for shape, elevation and color; no brand-only shadow, brand-only pill shape or other authored visual exception shall override those defaults.
- `OFFERS.GRID.CARDS.001-R10`: The Material 3 card defaults shall not change the structure, readability, action reachability, announced names, roles, states or narrow-viewport stacking defined by R1–R8.

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

Scenario: Maintenance actions sit behind a labelled control
  Given an offer card is displayed
  When the card actions are rendered
  Then only the three primary actions are visible
  And availability voting and reporting are reachable through one labelled control
  And the entries inside it carry text labels

Scenario: Card actions stack on a narrow mobile viewport
  Given offers are available on a narrow mobile viewport
  And an offer has localized action labels longer than one word
  When the card is rendered
  Then the favorite, directions, and comments actions shall each occupy a full-width row
  And each label shall wrap at word boundaries without breaking mid-word

Scenario: Offer tiles follow a Material 3 card structure
  Given offers are available in the feed
  When the grid is rendered
  Then each tile shall follow a Material 3 card pattern with an image area and a content area
  And the structure shall stay consistent across the grid

Scenario: Compact actions keep their Material 3 affordance at narrow widths
  Given offers are available on a narrow mobile viewport
  When the card is rendered
  Then the primary actions shall follow Material 3 button patterns with their announced names, roles and states unchanged
  And maintenance actions shall stay behind the one labelled disclosure

Scenario: A long localized label stays inside the card pattern
  Given an offer has a localized action label longer than one word
  When the card is rendered at a narrow width
  Then the label shall wrap within the Material 3 card without overflow
  And the action shall remain tappable

Scenario: Cards use Material 3 card defaults
  Given the offer grid is rendered
  When each card's shape and elevation are determined
  Then Material 3 card defaults shall apply
  And no brand-only shadow or pill exception shall override them

Scenario: Card defaults keep the touch floor and semantics
  Given the Android font scale is set to 200 percent
  And an offer card has a long localized action label
  When the card is rendered at a narrow width
  Then the action keeps a 48 by 48 dp target and its announced name, role and state
  And the label wraps within the card without overflow
```

## Example Inputs/Outputs
- Example input: 20 offers rendered at `390px` and `820px` viewport widths.
- Expected output: A compact card grid that keeps consistent framing and readability while increasing the visible column count on the wider viewport.
- Example input: 20 offers at a narrow phone width with localized action labels.
- Expected output: Material 3 cards with wrapped full-width action rows and unchanged action announcements.
- Example input: a card rendered with Material 3 card defaults.
- Expected output: M3 shape and elevation with no brand-only shadow or pill override, and the same reachable, announced actions.

## Edge Cases
- Very long descriptions truncate without overflowing card bounds.
- Missing image still keeps card layout intact with placeholder.
- Localized action labels containing long single words shall not overflow the full-width action rows.
- A localized action label containing a long single word — it stays within the Material 3 card bounds without breaking the layout.
- Material 3 card defaults applied at 200 percent font scale — the action target stays at 48 by 48 dp and its announced state is unchanged.

## Non-Functional Constraints
- Grid scrolling should remain smooth under typical list sizes.
- The Material 3 card pattern shall not reduce the reachable actions or change their announced names, roles and states.

## Related Specs
- `APP.ADAPTIVE.LANDSCAPE.001`
- `APP.LIST.VIRTUALIZATION.001`
- `OFFERS.LAYOUT.001`
- `OFFERS.IMAGE.RENDERING.001`
- `OFFERS.FAVORITES.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ADAPTIVE.UX.001`
- `APP.CONTEXT_MENU.001`
- `OFFERS.SEARCH.001`
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.ACTIONS.LABELS.001`
