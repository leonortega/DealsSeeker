# Spec: `ADD.OFFER.LAYOUT.001`

## Metadata
- **Title**: Add Offer View Layout Composition
- **Version**: `v1.6`
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
- `ADD.OFFER.LAYOUT.001-R1`: The system shall display an image upload area with a photo icon and preview support.
- `ADD.OFFER.LAYOUT.001-R2`: The system shall display a description input field.
- `ADD.OFFER.LAYOUT.001-R3`: The system shall display a tag management section with the current tag list and a suggested tags subsection.
- `ADD.OFFER.LAYOUT.001-R4`: The system shall display location information.
- `ADD.OFFER.LAYOUT.001-R5`: The system shall display `Confirm Location` action and a location search input with live suggestions.
- `ADD.OFFER.LAYOUT.001-R6`: The system shall display a mini map location preview in Add Offer view.
- `ADD.OFFER.LAYOUT.001-R7`: `Confirm Location` and `Edit Location` actions shall be positioned below the mini map.
- `ADD.OFFER.LAYOUT.001-R8`: After a successful create-offer response (no errors), the system shall redirect to `Offers` view.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Add Offer view displays required controls
  Given the user opens Add Offer view
  When the view loads
  Then image upload area, description, current tag list, suggested tags section, and location info shall be visible
  And a location search input with live suggestions shall be visible
  And a mini map location preview shall be visible
  And Confirm Location and Edit Location actions shall be visible below the mini map

Scenario: Successful add-offer submission redirects to Offers
  Given the user is in Add Offer view with valid offer data
  When the user submits create offer
  And the create-offer response is successful with no errors
  Then the system shall redirect the user to Offers view
```

## Example Inputs/Outputs
- Example input: Enter Add Offer view.
- Expected output: Full required layout blocks rendered.

## Edge Cases
- No camera capability still shows upload area and alternative gallery path.

## Non-Functional Constraints
- Layout remains usable on mobile portrait screens.

## Related Specs
- `ADD.OFFER.IMAGE.001`
- `ADD.OFFER.LOCATION.001`
- `ADD.OFFER.DESCRIPTION.TAGS.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
- `OFFERS.PHOTOS.CAROUSEL.001`
