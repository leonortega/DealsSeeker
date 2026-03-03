# Spec: `OFFERS.LIST.ITEM.001`

## Metadata
- **Title**: Offer Item Visual Structure
- **Version**: `v1.1`
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
- `OFFERS.LIST.ITEM.001-R5`: Each offer item shall provide a selectable destination action that opens walking directions per `OFFERS.MAP.001`.
- `OFFERS.LIST.ITEM.001-R6`: Each offer item shall display the distance in meters from the current user location.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Offer item displays required content blocks
  Given an offer exists with image, description, and tags
  When the offer item is displayed in the list
  Then the offer image shall be visible
  And the description shall be visible
  And matching keywords shall be highlighted in the description
  And the tags shall be listed below the description
  And the distance in meters from current location shall be visible

Scenario: Offer item supports destination selection
  Given an offer item with valid location is displayed
  When the user selects the offer item destination action
  Then walking directions shall open to that offer location
```

## Example Inputs/Outputs
- Example input: Offer with tags `coffee`, `breakfast`.
- Expected output: Item card shows image, description, highlighted keywords, visible tags list, and distance in meters.
- Example input: Select destination action on an offer item.
- Expected output: Directions launch behavior follows `OFFERS.MAP.001`.

## Edge Cases
- Missing image uses placeholder while preserving all other fields.
- No tags shows empty tag area state.

## Non-Functional Constraints
- Item rendering should remain smooth while scrolling.

## Related Specs
- `OFFERS.SEARCH.001`
- `OFFERS.MAP.001`
- `OFFERS.LIST.ACTIONS.001`
