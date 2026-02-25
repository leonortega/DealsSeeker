# Spec: `OFFERS.SEARCH.001`

## Metadata
- **Title**: Search Offers by Tags
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Allow users to find relevant offers using tag-based search text.

## Preconditions
- User is in Offers view.
- Offer dataset has tags per offer item.

## Trigger
- User executes a search from the search bar.

## Requirements
- `OFFERS.SEARCH.001-R1`: The system shall allow the user to enter a product name in the search bar.
- `OFFERS.SEARCH.001-R2`: The system shall match the entered text against offer tags.
- `OFFERS.SEARCH.001-R3`: The system shall filter the offer list to matching offers.
- `OFFERS.SEARCH.001-R4`: The system shall update map markers to reflect the filtered offers.
- `OFFERS.SEARCH.001-R5`: Matching shall follow the decision table in `decisions/DECISION_TABLES.md`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Search filters offer list and map markers
  Given the user is on Offers view
  And offers exist with tags including "coffee"
  When the user searches for "coffee"
  Then only offers with matching tags shall remain in the list
  And only businesses with matching offers shall remain as map markers

Scenario: Empty query clears filter
  Given the user previously searched and filtered results
  When the user clears the search text
  Then all active offers shall be shown
  And map markers shall reflect the full active offer set
```

## Example Inputs/Outputs
- Example input: Query `coffee`.
- Expected output: Offer list and map markers limited to offers tagged with `coffee` per matching rules.

## Edge Cases
- No matches returns empty list and zero business markers.
- Search text with mixed case matches case-insensitively.
- Multi-word query applies AND semantics.

## Non-Functional Constraints
- Search response should feel immediate for typical local datasets.

## Related Specs
- `OFFERS.MAP.001`
- `OFFERS.LIST.ITEM.001`

