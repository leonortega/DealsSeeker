# Spec: `OFFERS.SEARCH.001`

## Metadata
- **Title**: Offers Search Execution and Radius Refresh
- **Version**: `v1.4`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Allow users to execute offer search and keep list/map results synchronized as search or radius changes.

## Preconditions
- User is in Offers view.
- Offer dataset includes searchable metadata.

## Trigger
- User executes a search from the search bar or changes coverage radius.

## Requirements
- `OFFERS.SEARCH.001-R1`: The system shall allow the user to enter search text in the Offers search bar.
- `OFFERS.SEARCH.001-R2`: For non-empty query values, the system shall execute matching and scoring strategy defined in `OFFERS.SEARCH.SMART.001`.
- `OFFERS.SEARCH.001-R3`: The system shall filter and rank offer list results according to search and distance constraints.
- `OFFERS.SEARCH.001-R4`: The system shall update map markers to reflect the filtered offer set.
- `OFFERS.SEARCH.001-R5`: Matching, ranking, and radius refresh behavior shall follow `decisions/DECISION_TABLES.md`.
- `OFFERS.SEARCH.001-R6`: When the coverage radius value changes, the system shall execute a new search using the new radius value.
- `OFFERS.SEARCH.001-R7`: If search textbox contains text, radius-triggered search shall apply search matching plus distance filtering.
- `OFFERS.SEARCH.001-R8`: If search textbox is empty, radius-triggered search shall apply distance filtering only.
- `OFFERS.SEARCH.001-R9`: Radius-triggered search refresh shall update both offer list and map markers.
- `OFFERS.SEARCH.001-R10`: Radius-triggered search refresh shall adjust map zoom to visualize the selected coverage radius.
- `OFFERS.SEARCH.001-R11`: While search or required location resolution is in progress, the view shall show a blocking animated loading state as defined in `APP.SHELL.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Search filters offer list and map markers
  Given the user is on Offers view
  And offers exist with searchable terms including "coffee"
  When the user searches for "coffee"
  Then only matching offers shall remain in the list
  And only businesses with matching offers shall remain as map markers

Scenario: Empty query clears filter
  Given the user previously searched and filtered results
  When the user clears the search text
  Then all active offers shall be shown
  And map markers shall reflect the full active offer set

Scenario: Coverage radius change with active query re-runs search
  Given the user entered a non-empty search query in the Offers search textbox
  And current offers and map markers are shown for the current radius
  When the user changes the coverage radius value
  Then the system shall execute a new search with the same query and updated radius
  And the offer list shall refresh using the new radius
  And map markers shall refresh using the new radius
  And map zoom shall adjust to show the selected coverage radius

Scenario: Coverage radius change without query re-runs distance-only search
  Given the search textbox is empty
  And current offers and map markers are shown for the current radius
  When the user changes the coverage radius value
  Then the system shall execute a new search using distance filtering only
  And the offer list shall refresh using the new radius
  And map markers shall refresh using the new radius
  And map zoom shall adjust to show the selected coverage radius

Scenario: Required location/search wait blocks interaction
  Given the Offers view is resolving current location or executing search
  When required data is still loading
  Then an animated blocking loading state shall be visible
  And user interaction with offers list and map controls shall be blocked
  And after loading completes the view shall become interactive
```

## Example Inputs/Outputs
- Example input: Query `coffee`.
- Expected output: Offer list and map markers include matched offers ranked by current search rules.

## Edge Cases
- No matches returns empty list and zero business markers.
- Search text with mixed case matches case-insensitively.
- Coverage radius change with empty query applies distance-only filtering and refreshes list/map.
- Coverage radius change also adjusts map zoom to keep selected radius visible.
- Required location resolution timeout/failure shall remove the loading state and show the corresponding non-blocking error/empty state.

## Non-Functional Constraints
- Search response should feel immediate for typical local datasets.

## Related Specs
- `OFFERS.SEARCH.SMART.001`
- `OFFERS.MAP.001`
- `OFFERS.LIST.ITEM.001`
- `OFFERS.REPORTED.DEMOTION.001`
