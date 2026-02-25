# Spec: `OFFERS.LIST.ITEM.001`

## Metadata
- **Title**: Offer Item Visual Structure
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Define mandatory content displayed per offer list item.

## Preconditions
- Offers list has at least one offer item.

## Trigger
- Offer item is rendered in Offers list.

## Requirements
- `OFFERS.LIST.ITEM.001-R1`: The system shall display an offer image.
- `OFFERS.LIST.ITEM.001-R2`: The system shall display a short offer description.
- `OFFERS.LIST.ITEM.001-R3`: The system shall highlight keywords in the description.
- `OFFERS.LIST.ITEM.001-R4`: The system shall display associated tags below the description.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offer item displays required content blocks
  Given an offer exists with image, description, and tags
  When the offer item is displayed in the list
  Then the offer image shall be visible
  And the description shall be visible
  And matching keywords shall be highlighted in the description
  And the tags shall be listed below the description
```

## Example Inputs/Outputs
- Example input: Offer with tags `coffee`, `breakfast`.
- Expected output: Item card shows image, description, highlighted keywords, and visible tags list.

## Edge Cases
- Missing image uses placeholder while preserving all other fields.
- No tags shows empty tag area state.

## Non-Functional Constraints
- Item rendering should remain smooth while scrolling.

## Related Specs
- `OFFERS.SEARCH.001`
- `OFFERS.LIST.ACTIONS.001`

