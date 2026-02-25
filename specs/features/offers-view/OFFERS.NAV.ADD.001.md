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
- User presses the `+` button near search.

## Requirements
- `OFFERS.NAV.ADD.001-R1`: The system shall navigate to Add Offer view when the `+` button is pressed.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Plus button opens Add Offer view
  Given the user is in Offers view
  When the user presses the plus button
  Then the Add Offer view shall be displayed
```

## Example Inputs/Outputs
- Example input: Tap plus button.
- Expected output: Add Offer view opens.

## Edge Cases
- Repeated taps should not open multiple stacked Add Offer views.

## Non-Functional Constraints
- Navigation transition should complete without blocking the UI.

## Related Specs
- `ADD.OFFER.LAYOUT.001`

