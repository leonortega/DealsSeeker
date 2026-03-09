# Spec: `ADD.OFFER.TAGS.SUGGESTIONS.001`

## Metadata
- **Title**: Suggested Tags from Selected Tags
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Assist users with optional suggested tags derived from the currently selected tags.

## Preconditions
- User is in Add Offer view.
- Zero or more selected tags may exist.

## Trigger
- User adds or removes a selected tag.

## Requirements
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R1`: The system shall display a dedicated `Suggested Tags` section in Add Offer view.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R2`: Suggested tags shall be derived from the current selected tag list, not directly from raw description text.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R3`: The system shall suggest synonyms and semantically related tags from a multilingual dictionary.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R4`: The system shall also suggest singular/plural variations of selected tags when valid normalized tags can be derived.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R5`: Suggestions shall be non-blocking and rendered as optional tappable chips.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R6`: Tapping a suggested tag shall add it to the selected tag list using the same normalization and duplicate-prevention rules as description-derived tags.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R7`: Suggested tags shall not be persisted unless explicitly selected by the user.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R8`: Suggestion dictionaries and related-term generation shall follow the selected app language, with fallback to default language resources.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R9`: When the description text is erased and selected tags are cleared, the Suggested Tags section shall also clear its suggestion chips.

## Acceptance Criteria (BDD)
```gherkin
Scenario: User receives related suggestions from a selected tag
  Given the user selected the tag "coffee"
  And multilingual suggestion dictionaries are available
  When the suggestion engine runs
  Then the user shall see optional chips for related tags such as "cafe" and "espresso"
  And the current selected tag list shall not change until the user taps a suggested tag

Scenario: Singular and plural variations are suggested from selected tags
  Given the user selected the tag "offers"
  When the suggestion engine runs
  Then the user shall see the related suggestion "offer"

Scenario: Suggestions remain non-blocking when no selected tags exist
  Given the user has not selected any tags yet
  When the Add Offer tag section is displayed
  Then the Suggested Tags section shall remain visible
  And the system shall prompt the user to select a tag first

Scenario: Clearing description removes suggestion chips
  Given the selected tag list includes "coffee"
  And the Suggested Tags section currently shows related chips
  When the user erases the description text completely
  Then the selected tag list shall be empty
  And the Suggested Tags section shall not show related chips
```

## Example Inputs/Outputs
- Example input: Selected tag `coffee`.
- Expected output: Optional suggestions such as `cafe`, `espresso`, and language-appropriate equivalents.
- Example input: Selected tag `offers`.
- Expected output: Optional suggestion `offer`.

## Edge Cases
- Duplicate suggestions are shown once.
- Suggestions violating tag normalization rules are not displayed.
- Switching app language refreshes suggested tags for the same base tags.
- Clearing the description removes selected tags and therefore clears suggestion chips immediately.

## Non-Functional Constraints
- Suggestions should appear with minimal delay after tag selection.

## Related Specs
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `APP.LOCALIZATION.001`
