# Spec: `ADD.OFFER.DESCRIPTION.TAGS.001`

## Metadata
- **Title**: Description Input and Selected Tag Management
- **Version**: `v1.3`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Allow users to write description and manage tags instantly from typed words and the selected tag list.

## Preconditions
- User is on Add Offer view.

## Trigger
- User enters description text, taps a word, or manages tags.

## Requirements
- `ADD.OFFER.DESCRIPTION.TAGS.001-R1`: The system shall allow entering textual description.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R2`: The system shall detect words in the description and update word/tag candidates instantly while the user types.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R3`: The system shall create a tag when the user taps a detected word.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R4`: The system shall display the current tag list below description field.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R5`: The system shall allow removing tags from the current tag list.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R6`: If a detected word includes a trailing percent symbol (example `50%`), the created tag shall preserve the percent symbol.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R7`: Tag normalization and duplicate handling shall follow the decision table.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R8`: When the description text is erased to empty or whitespace-only, the system shall clear the selected tag list.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R9`: The save action shall require a non-empty description before create-offer or edit-offer submission proceeds.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R10`: The save action shall require at least one selected tag before create-offer or edit-offer submission proceeds.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Create tag by tapping a detected word
  Given the user entered description "Fresh coffee near station"
  When the user taps the detected word "coffee"
  Then the tag "coffee" shall be created
  And the tag list shall show "coffee"

Scenario: Preserve percent symbol in numeric tags
  Given the user entered description "All drinks 50% off"
  When the user taps the detected word "50%"
  Then the tag "50%" shall be created

Scenario: Duplicate tapped tag is ignored
  Given the tag list already includes "coffee"
  When the user taps the detected word "Coffee"
  Then no duplicate tag shall be added

Scenario: Remove selected tag
  Given the tag list includes "coffee"
  When the user removes the tag "coffee"
  Then the tag list shall no longer show "coffee"

Scenario: Clearing description removes selected tags
  Given the selected tag list includes "coffee" and "discount"
  When the user erases the description text completely
  Then the selected tag list shall be empty

Scenario: Save is blocked when description is empty
  Given the selected tag list includes "coffee"
  And the description is empty or whitespace-only
  When the user submits save
  Then the system shall block submission
  And the system shall show a description-required validation error

Scenario: Save is blocked when no tags are selected
  Given the description is "Fresh coffee near station"
  And the selected tag list is empty
  When the user submits save
  Then the system shall block submission
  And the system shall show a tag-required validation error
```

## Example Inputs/Outputs
- Example input: Description `cheap COFFEE`, tap `COFFEE`.
- Expected output: Tag list contains normalized `coffee` once.
- Example input: Description `50% discount`, tap `50%`.
- Expected output: Tag list contains `50%`.

## Edge Cases
- Tapping whitespace creates no tag.
- Detected word list updates continuously as the description changes.
- User removes existing tag and list updates immediately.
- Clearing the description removes all selected tags so no stale tag state remains.
- Description-required and tag-required validation applies before both create-offer and edit-offer submission.

## Non-Functional Constraints
- Tag actions should provide immediate visual feedback.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `OFFERS.SEARCH.001`
