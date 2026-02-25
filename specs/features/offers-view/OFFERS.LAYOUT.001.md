# Spec: `OFFERS.LAYOUT.001`

## Metadata
- **Title**: Offers View Layout Composition
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Define required UI blocks for the default Offers view.

## Preconditions
- User is in the Offers section.

## Trigger
- Offers view is rendered.

## Requirements
- `OFFERS.LAYOUT.001-R1`: The system shall display a search bar.
- `OFFERS.LAYOUT.001-R2`: The system shall display a `+` button near the search bar.
- `OFFERS.LAYOUT.001-R3`: The system shall display a map component.
- `OFFERS.LAYOUT.001-R4`: The system shall display a distance indicator below the map.
- `OFFERS.LAYOUT.001-R5`: The system shall display a list of offers below the map area.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offers view shows all required sections
  Given the user navigates to the Offers section
  When the Offers view loads
  Then the view shall show a search bar and a nearby plus button
  And a map component shall be visible
  And a distance indicator shall be visible below the map
  And an offer list shall be visible below the map area
```

## Example Inputs/Outputs
- Example input: Navigate to Offers section.
- Expected output: All required layout blocks are visible.

## Edge Cases
- Empty offer data still shows layout with empty-state list.

## Non-Functional Constraints
- Layout shall remain usable on small mobile screens.

## Related Specs
- `OFFERS.SEARCH.001`
- `OFFERS.MAP.001`
- `OFFERS.LIST.ITEM.001`
- `OFFERS.NAV.ADD.001`

