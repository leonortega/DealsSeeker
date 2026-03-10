# Spec: `OFFERS.SEARCH.SMART.001`

## Metadata
- **Title**: Smart Search Matching and Relevance Ranking
- **Version**: `v0.1`
- **Status**: Draft
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Improve offer discovery by combining exact, fuzzy, and synonym-based search.

## Preconditions
- User is in Offers view.
- Search query is provided.
- Search dictionaries are available for at least one language.

## Trigger
- User executes a search from the Offers search input.

## Requirements
- `OFFERS.SEARCH.SMART.001-R1`: The system shall execute exact matching on the normalized query string.
- `OFFERS.SEARCH.SMART.001-R2`: The system shall execute fuzzy/similarity matching against normalized searchable offer terms derived from descriptions, tags, and multilingual related-term expansion.
- `OFFERS.SEARCH.SMART.001-R3`: Fuzzy matching shall use a product-defined similarity ratio threshold that is consistent across equivalent search providers.
- `OFFERS.SEARCH.SMART.001-R4`: The system shall execute synonym expansion to include semantically related terms from a multilingual dictionary.
- `OFFERS.SEARCH.SMART.001-R5`: The system shall merge exact, fuzzy, and synonym match result sets into one de-duplicated result set.
- `OFFERS.SEARCH.SMART.001-R6`: The system shall assign a relevance score to every result using match strategy and score strength.
- `OFFERS.SEARCH.SMART.001-R7`: The system shall rank merged results by relevance score before distance tie-breakers.
- `OFFERS.SEARCH.SMART.001-R8`: If the selected-language dictionary is unavailable, the system shall fall back to exact matching and keep search available.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Smart search merges exact, fuzzy, and synonym matches
  Given offers exist for tags "coffee", "cafe", and "espresso"
  And fuzzy and synonym dictionaries are configured for the selected language
  When the user searches for "coffe"
  Then exact, fuzzy, and synonym result candidates shall be evaluated
  And merged unique results shall be returned
  And results shall be ordered by relevance score

Scenario: Missing language dictionary falls back safely
  Given the selected app language has no loaded synonym dictionary
  When the user searches for "coffee"
  Then exact matching shall still execute
  And the search flow shall not fail
```

## Example Inputs/Outputs
- Example input: Query `coffe`.
- Expected output: Results include `coffee` offers via fuzzy matching and related terms via synonym expansion, ranked by relevance.

## Edge Cases
- Empty query bypasses smart matching and returns standard unfiltered feed behavior.
- Duplicate matches from multiple strategies appear once in merged output.
- Ties in relevance score are resolved by distance ascending.

## Non-Functional Constraints
- Smart search response should remain interactive for typical mobile datasets.

## Related Specs
- `OFFERS.SEARCH.001`
- `APP.LOCALIZATION.001`
