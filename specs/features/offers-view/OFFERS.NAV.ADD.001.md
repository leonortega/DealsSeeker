# Spec: `OFFERS.NAV.ADD.001`

## Metadata
- **Title**: Navigate to Add Offer from Offers View
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Enable users to start offer creation from the Offers view.

## Preconditions
- User is in Offers view.

## Trigger
- User selects the Create option in the shared bottom footer.

## Requirements
- `OFFERS.NAV.ADD.001-R1`: The system shall navigate to Add Offer view when the Create footer option is selected, in both the standard and immersive views.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Create footer option opens Add Offer view
  Given the user is in Offers view
  When the user selects Create in the bottom footer
  Then the Add Offer view shall be displayed

Scenario: Create footer option opens Add Offer view from the immersive feed
  Given the user is on the immersive offers feed
  When the user selects Create in the bottom footer
  Then the Add Offer view shall be displayed
```

## Example Inputs/Outputs
- Example input: Tap the Create footer option.
- Expected output: Add Offer view opens.

## Edge Cases
- Repeated taps should not open multiple stacked Add Offer views.

## Non-Functional Constraints
- Navigation transition should complete without blocking the UI.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `OFFERS.FEED.IMMERSIVE.001`

