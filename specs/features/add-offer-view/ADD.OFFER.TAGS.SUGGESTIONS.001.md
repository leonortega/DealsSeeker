# Spec: `ADD.OFFER.TAGS.SUGGESTIONS.001`

## Metadata
- **Title**: Tag Suggestions with Fuzzy and Synonym Assistance
- **Version**: `v0.1`
- **Status**: Draft
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Assist users with optional tag suggestions derived from similarity and synonyms.

## Preconditions
- User is in Add Offer view.
- Description text or base tags are available.

## Trigger
- User creates or selects tags from description text.

## Requirements
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R1`: The system shall suggest additional tags based on dictionary similarity against current tags.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R2`: Similarity suggestions shall use a configurable ratio threshold, with default value marked as TBD.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R3`: The system shall suggest synonyms and semantically related tags from a multilingual dictionary.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R4`: Suggestions shall be non-blocking and rendered as optional chips/pills.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R5`: The user shall be able to review and remove any suggested tags before submission.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R6`: Suggested tags shall not be persisted unless explicitly accepted by the user.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R7`: Suggestion dictionaries shall follow the selected app language.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User receives optional fuzzy and synonym suggestions
  Given the user selected the tag "coffee"
  And multilingual suggestion dictionaries are available
  When the suggestion engine runs
  Then the user shall see optional chips for similar and related tags
  And the user may remove any suggested chip before submit

Scenario: Suggestions are non-blocking
  Given suggestion dictionaries are unavailable
  When the user adds tags manually
  Then tag editing and offer submission shall remain available
```

## Example Inputs/Outputs
- Example input: Base tag `coffee`.
- Expected output: Optional suggestions such as `cafe`, `espresso`, and language-appropriate equivalents.

## Edge Cases
- Duplicate suggestions are shown once.
- Suggestions violating tag normalization rules are not displayed.
- Switching app language refreshes suggested tags for the same base tags.

## Non-Functional Constraints
- Suggestions should appear with minimal delay after tag selection.

## Related Specs
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `APP.LOCALIZATION.001`
