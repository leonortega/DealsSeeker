# Spec: `OFFERS.FILTER.SIMPLIFICATION.001`

## Metadata
- **Title**: Single Coverage-Distance Control
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Offers View (standard map presentation and immersive search sheet)
- **Priority**: Medium

## Purpose
Reduce the visible filter decisions in Offers from five coverage chips to one glanceable control without changing search behavior.

## Preconditions
- The user is authenticated on the Offers view in either presentation.
- A coverage distance is selected.

## Trigger
- The filter controls are rendered, or the user opens or changes the coverage distance.

## Requirements
- `OFFERS.FILTER.SIMPLIFICATION.001-R1`: The coverage distance shall be shown as one visible control displaying the current value; the complete set of supported distances shall be reachable from that control.
- `OFFERS.FILTER.SIMPLIFICATION.001-R2`: Selecting a distance shall apply it to the search immediately and keep the chosen value visible in the control.
- `OFFERS.FILTER.SIMPLIFICATION.001-R3`: The query input and Favorites-only control shall remain directly visible where they are today.
- `OFFERS.FILTER.SIMPLIFICATION.001-R4`: The same control and distance options shall be used in the standard Offers view and the immersive search sheet.
- `OFFERS.FILTER.SIMPLIFICATION.001-R5`: The control shall use the pill shape, meet the touch floor, and expose its current value and selected state to assistive technology.
- `OFFERS.FILTER.SIMPLIFICATION.001-R6`: Search behavior, result ordering and the supported distance values shall not change.

## Acceptance Criteria (BDD)
```gherkin
Scenario: One coverage control replaces the chip row
  Given the Offers view is displayed in either presentation
  When the filter controls are rendered
  Then one control shows the current coverage distance
  And the five supported distances are not shown simultaneously

Scenario: Changing the distance applies immediately
  Given the current coverage distance is 1500 m
  When the user opens the control and selects 500 m
  Then the control shows 500 m
  And offers are searched with the new distance

Scenario: Other filters stay reachable
  Given the standard Offers view is displayed
  When the filter panel is rendered
  Then the query input and Favorites-only control remain directly visible

Scenario: Assistive technology reads the current distance
  Given a coverage distance is selected
  When the control is focused
  Then its accessible name includes the current distance
  And its selected state is announced
```

## Example Inputs/Outputs
- Example input: default 1500 m in the Map view.
- Expected output: one pill reading `Distance: 1500 m`; tapping it shows 500, 1000, 1500, 2500 and 5000 m.
- Example input: selecting 2500 m in the immersive search sheet.
- Expected output: control reads `Distance: 2500 m`; results refresh for that radius.

## Edge Cases
- A long localized label for the control at large text sizes.
- Selecting the already-current distance.
- Changing distance while a search is in flight.
- Closing the picker without choosing.

## Non-Functional Constraints
- No new picker dependency; the expanded options stay within the presenting surface rather than opening a nested sheet.
- The waypoint accent remains reserved for the active path; the selected distance keeps its muted fill and accent text.
- Localized labels and EN/ES parity are preserved.

## Related Specs
- `OFFERS.SEARCH.001`
- `APP.ADAPTIVE.UX.002`
- `APP.BOTTOM_SHEET.001`
- `OFFERS.MODE.SWITCH.001`
