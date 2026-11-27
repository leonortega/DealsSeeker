# Spec: `ADD.OFFER.TAGS.SUGGESTIONS.001`

## Metadata
- **Title**: User-Confirmed Tag Suggestions
- **Version**: `v3.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: Medium

## Purpose
Offer related tags as explicit suggestions that the contributor chooses to accept, without changing the tag list silently.

## Preconditions
- User is on Add Offer view.
- Zero or more description-derived tags may exist.

## Trigger
- A description-derived tag is added, removed or cleared, or the user acts on a suggested tag.

## Requirements
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R1`: The system shall present related tags as opt-in suggestions; no suggested tag shall enter the selected tag list without explicit user acceptance.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R2`: The system shall derive suggestions of at least 3 normalized characters from the description-derived tags (typed words, manual detected-word taps and final words committed at edit end).
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R3`: The system shall suggest synonyms, semantically related tags and singular/plural variants from a multilingual dictionary following the selected app language, with fallback to default language resources.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R4`: Suggestion expansion shall be one level only; an accepted suggested tag shall not be used as a source for further suggestions.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R5`: Suggestions whose normalized form has fewer than 3 characters shall not be presented.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R6`: A suggestion the user declines shall not be presented again while its source description-derived tags stay unchanged; it may be offered again after the source changes or the description is cleared.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R7`: When the description is cleared, the description-derived tag set and all suggestion state shall be cleared.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R8`: Each suggestion shall expose an explicit acceptance control such as `Add`, and the suggestion area shall not state that related tags are added automatically.
- `ADD.OFFER.TAGS.SUGGESTIONS.001-R9`: A tag removed by the user shall not be silently re-added; it shall return only through explicit acceptance or after the description is cleared.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Related tags are offered but not auto-added
  Given the user typed "denims " so the tag "denims" is selected
  And multilingual suggestion dictionaries are available
  When suggestions are computed
  Then "denim" is offered as a suggestion
  And the selected tag list still contains only "denims"

Scenario: One-level expansion only
  Given the description-derived tag "coffee" has immediate suggestions "cafe" and "espresso"
  When the user accepts "cafe"
  Then suggestions derived from "cafe" are not offered

Scenario: Short suggestions are ignored
  Given a description-derived tag has a related tag whose normalized form has fewer than 3 characters
  When suggestions are computed
  Then that short tag is not presented as a suggestion

Scenario: Declined suggestion stays declined
  Given the user declined the suggested tag "denim"
  And the source description-derived tag "denims" is unchanged
  When suggestions are refreshed
  Then "denim" is not offered again

Scenario: Clearing description clears suggestion state
  Given the description-derived tag "denims" produced an offered "denim" suggestion
  When the user clears the description text
  Then the selected tag list shall be empty
  And no suggestion state shall remain

Scenario: Suggestions require explicit acceptance
  Given a suggestion "denim" is displayed with an Add control
  When the user selects Add for "denim"
  Then "denim" is added to the selected tag list
  And no tag is added without such an explicit selection

Scenario: Removed accepted tag is not silently restored
  Given the user accepted the suggested tag "denim"
  When the user removes "denim" from the tag list
  Then "denim" stays removed until the user accepts it again or clears the description
```

## Example Inputs/Outputs
- Example input: Description-derived tag `denims` with locale `en-US`.
- Expected output: `denim` is offered as a suggestion; selected tags remain `denims` until the user accepts it.
- Example input: Description-derived tag `coffee` with locale `en-US`.
- Expected output: `cafe`, `espresso` and `latte` are offered; accepting one does not chain further suggestions.

## Edge Cases
- Suggestions are derived only from description-derived tags, never from accepted suggestion tags.
- Duplicate suggestions follow the existing duplicate-prevention rules.
- Suggestions violating tag normalization rules are not presented.
- Switching app language refreshes suggestions for the same description-derived tags.
- A declined suggestion stays hidden while the description is unchanged.
- Clearing the description immediately removes all tags and suggestion state.

## Non-Functional Constraints
- The suggestion area shall fit the Add Offer tag section without a dedicated silent auto-add mechanism.
- Suggestions should appear with minimal delay after a description-derived tag is added.
- Raw coordinate values shall not be exposed in the Add Offer view.

## Related Specs
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ADD.OFFER.LAYOUT.001`
- `APP.LOCALIZATION.001`
- `ADD.OFFER.TAG.LIMIT.001`
- `ADD.OFFER.SEQUENCED.001`
- `ADD.OFFER.UX.001`
