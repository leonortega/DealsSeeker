# Spec: `OFFERS.LAYOUT.001`

## Metadata
- **Title**: Offers View Layout Composition
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Define required UI blocks for the Offers view.

## Preconditions
- User is authenticated and in the Offers section.

## Trigger
- Offers view is rendered.

## Requirements
- `OFFERS.LAYOUT.001-R1`: The system shall display a search bar.
- `OFFERS.LAYOUT.001-R2`: The system shall display a `+` button near the search bar.
- `OFFERS.LAYOUT.001-R3`: The system shall display a map component.
- `OFFERS.LAYOUT.001-R4`: The system shall display a coverage radius control directly below the search textbox.
- `OFFERS.LAYOUT.001-R5`: The system shall display an offers feed area rendered as a grid/list presentation component below the map area.
- `OFFERS.LAYOUT.001-R6`: On initial load before any user search, the system shall support rendering a promoted offers section per `OFFERS.FEED.PROMOTED.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offers view shows all required sections
  Given the user navigates to the Offers section
  When the Offers view loads
  Then the view shall show a search bar and a nearby plus button
  And a coverage radius control shall be visible below the search textbox
  And a map component shall be visible
  And an offers feed area shall be visible below the map area

Scenario: Initial load supports promoted section
  Given promoted offers are available
  And the user has not executed a search yet
  When the Offers view loads
  Then a promoted offers section shall be visible at the top of feed area
```

## Example Inputs/Outputs
- Example input: Navigate to Offers section.
- Expected output: All required layout blocks are visible.

## Edge Cases
- Empty offer data still shows layout with empty-state feed.

## Non-Functional Constraints
- Layout shall remain usable on small mobile screens.

## Related Specs
- `OFFERS.SEARCH.001`
- `OFFERS.MAP.001`
- `OFFERS.GRID.CARDS.001`
- `OFFERS.FEED.PROMOTED.001`
- `OFFERS.NAV.ADD.001`
