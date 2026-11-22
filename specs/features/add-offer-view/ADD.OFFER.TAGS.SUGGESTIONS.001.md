# Spec: `ADD.OFFER.TAGS.SUGGESTIONS.001`

## Metadata
- **Title**: Silent Auto-Addition of Suggested Tags
- **Version**: `v2.2`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Automatically add related tags derived from the tags the user created from the description, without showing a dedicated Suggested Tags section.

## Preconditions
- User is on Add Offer view.
- Zero or more description-derived tags may exist.

## Trigger
- A description-derived tag is added, removed, or cleared.

## Requirements
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R1`: The system shall not display a `Suggested Tags` section in Add Offer view.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R2`: The system shall automatically add related tags of at least 3 normalized characters derived from the description-derived tags (typed words, manual detected-word taps, and final words committed at edit end) to the selected tag list.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R3`: The system shall suggest synonyms, semantically related tags, and singular/plural variants from a multilingual dictionary following the selected app language, with fallback to default language resources.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R4`: Suggestion expansion shall be one level only. Tags that were auto-added from suggestions shall not be used as a source for further suggestions.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R5`: Suggested tags whose normalized form has fewer than 3 characters shall be ignored.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R6`: A tag removed by the user shall not be automatically re-added unless the user adds it again explicitly or the description is cleared.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R7`: When the description is cleared, the description-derived tag set and all related auto-add state shall be cleared.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R8`: The tag section shall display a brief inline note explaining that related tags are added automatically, without a dedicated Suggested Tags section or per-tag provenance markers.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Related tags are added silently from a typed tag
  Given the user typed "denims " so the tag "denims" is selected
  And multilingual suggestion dictionaries are available
  When the suggestion engine runs
  Then the tag "denim" shall be added automatically
  And no Suggested Tags section shall be displayed

Scenario: One-level expansion only
  Given the description-derived tag "coffee" has immediate suggestions "cafe" and "espresso"
  When the suggestion engine runs
  Then only the immediate suggestions of "coffee" shall be auto-added
  And no tag derived from "cafe" or "espresso" shall be auto-added

Scenario: Short suggestions are ignored
  Given a description-derived tag has a related tag whose normalized form has fewer than 3 characters
  When the suggestion engine runs
  Then that short tag shall not be added to the tag list

Scenario: Removed suggested tag stays removed
  Given the tag "denim" was auto-added from the description-derived tag "denims"
  When the user removes the tag "denim"
  Then the tag "denim" shall not be re-added automatically

Scenario: Clearing description clears suggestion state
  Given the description-derived tag "denims" produced an auto-added "denim" tag
  When the user clears the description text
  Then the selected tag list shall be empty
  And no suggestion state shall remain

Scenario: Inline note explains automatic tag addition
  Given the user opens Add Offer view
  When the tag section loads
  Then a brief inline note shall state that related tags are added automatically
  And no Suggested Tags section shall be displayed
  And no per-tag provenance markers shall be displayed
```

## Example Inputs/Outputs
- Example input: Description-derived tag `denims` with locale `en-US`.
- Expected output: Tags `denims` and `denim`; no Suggested Tags section is displayed.
- Example input: Description-derived tag `coffee` with locale `en-US`.
- Expected output: Tags `coffee`, `cafe`, `espresso`, and `latte` only — no chaining from those suggestions.

## Edge Cases
- Suggestions are added only from description-derived tags, never from auto-added suggestion tags.
- Duplicate suggestions are handled through the existing duplicate-prevention rules.
- Suggestions violating tag normalization rules are not added.
- Switching app language refreshes suggestions for the same description-derived tags.
- A removed suggested tag is not re-added while the description stays unchanged.
- Clearing the description removes all tags and suggestion state immediately.

## Non-Functional Constraints
- The Add Offer tag section stays limited to detected words and the current tag list, keeping the UI simple.
- Suggestions should appear in the tag list with minimal delay after a description-derived tag is added.

## Related Specs
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ADD.OFFER.LAYOUT.001`
- `APP.LOCALIZATION.001`
- `ADD.OFFER.TAG.LIMIT.001`
