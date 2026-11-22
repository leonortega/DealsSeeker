# Spec: `ADD.OFFER.TAG.LIMIT.001`

## Metadata
- **Title**: Bounded tag list in the Add Offer view
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Keep the draft's tag list within the declared request limit so an offer assembled by the UI can be submitted without manual cleanup.

## Preconditions
- The user is on the Add Offer view in create or edit mode.

## Trigger
- Tags are added automatically from the description, expanded from suggestions, or added manually.

## Requirements
- `ADD.OFFER.TAG.LIMIT.001-R1`: The draft shall hold at most 10 tags at any time.
- `ADD.OFFER.TAG.LIMIT.001-R2`: Description-derived tags shall take precedence over automatic suggestion tags when the list is full.
- `ADD.OFFER.TAG.LIMIT.001-R3`: Automatic tag creation shall stop at the limit without silently exceeding it.
- `ADD.OFFER.TAG.LIMIT.001-R4`: When the limit is reached, the system shall announce it once and show a short limit hint in the tag section.
- `ADD.OFFER.TAG.LIMIT.001-R5`: Removing a tag shall make room for another tag to be added.
- `ADD.OFFER.TAG.LIMIT.001-R6`: The limit shall apply in create mode, edit mode, and after a suggestion expansion.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Automatic tags stop at the declared limit
  Given the user types a description with more than 10 taggable words
  When description and suggestion tags are generated
  Then the selected tag list holds exactly 10 tags
  And the limit is announced once

Scenario: Description tags win over suggestions
  Given the description has already produced 10 tags
  When suggestion expansion would add more tags
  Then no suggestion tag is added
  And all description-derived tags already selected remain

Scenario: Manual addition at the limit is refused with feedback
  Given the tag list already holds 10 tags
  When the user taps a detected word
  Then the list still holds 10 tags
  And the limit message is shown

Scenario: Removing a tag frees a slot
  Given the tag list holds 10 tags
  When the user removes one tag
  Then a new tag can be added
```

## Example Inputs/Outputs
- Example input: "coffee deal 50% fresh market bakery discount promo sale offer nearby cheap"
- Expected output: at most 10 selected tags; a short "Up to 10 tags" hint; no rejected submission due to tag count.

## Edge Cases
- A prefilled edit draft already holding 10 tags.
- Large text sizes where the hint wraps below the tag chips.
- A localized limit message longer than the source text.

## Non-Functional Constraints
- The limit shall match the API contract's declared maximum rather than a separate client value.

## Related Specs
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `ADD.OFFER.INPUT.BOUNDS.001`
