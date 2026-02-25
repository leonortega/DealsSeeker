# Spec: `ADD.OFFER.DESCRIPTION.TAGS.001`

## Metadata
- **Title**: Description Input and Tag Management
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Allow users to write description and manage tags from long-press or manual input.

## Preconditions
- User is on Add Offer view.

## Trigger
- User enters description text, long-presses a word, or manages tags.

## Requirements
- `ADD.OFFER.DESCRIPTION.TAGS.001-R1`: The system shall allow entering textual description.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R2`: The system shall create a tag when user presses and holds a word for at least 2 seconds.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R3`: The system shall display the current tag list below description field.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R4`: The system shall allow manual add and remove of tags.
- `ADD.OFFER.DESCRIPTION.TAGS.001-R5`: Tag normalization and duplicate handling shall follow the decision table.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Create tag by long-pressing a word
  Given the user entered description "Fresh coffee near station"
  When the user long-presses the word "coffee" for 2 seconds
  Then the tag "coffee" shall be created
  And the tag list shall show "coffee"

Scenario: Duplicate long-press tag is ignored
  Given the tag list already includes "coffee"
  When the user long-presses "Coffee" for 2 seconds
  Then no duplicate tag shall be added
```

## Example Inputs/Outputs
- Example input: Description `cheap COFFEE`, long-press `COFFEE`.
- Expected output: Tag list contains normalized `coffee` once.

## Edge Cases
- Long-press on whitespace creates no tag.
- Long-press shorter than threshold creates no tag.
- User removes existing tag and list updates immediately.

## Non-Functional Constraints
- Tag actions should provide immediate visual feedback.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `OFFERS.SEARCH.001`

