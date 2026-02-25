# Spec: `ADD.OFFER.LAYOUT.001`

## Metadata
- **Title**: Add Offer View Layout Composition
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Define required UI blocks for add-offer data entry.

## Preconditions
- User has navigated to Add Offer view.

## Trigger
- Add Offer view renders.

## Requirements
- `ADD.OFFER.LAYOUT.001-R1`: The system shall display an image placeholder with a photo icon.
- `ADD.OFFER.LAYOUT.001-R2`: The system shall display a description input field.
- `ADD.OFFER.LAYOUT.001-R3`: The system shall display a tag list section.
- `ADD.OFFER.LAYOUT.001-R4`: The system shall display location information.
- `ADD.OFFER.LAYOUT.001-R5`: The system shall display `Confirm Location` and `Search Location` actions.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Add Offer view displays required controls
  Given the user opens Add Offer view
  When the view loads
  Then image placeholder, description, tag list, and location info shall be visible
  And Confirm Location and Search Location actions shall be visible
```

## Example Inputs/Outputs
- Example input: Enter Add Offer view.
- Expected output: Full required layout blocks rendered.

## Edge Cases
- No camera capability still shows placeholder and alternative upload path.

## Non-Functional Constraints
- Layout remains usable on mobile portrait screens.

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`

