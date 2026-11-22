# Spec: `OFFERS.NAV.ADD.001`

## Metadata
- **Title**: Navigate to Add Offer from Offers View
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Enable users to start offer creation from a single, consistent action in both presentations.

## Preconditions
- User is authenticated and in the Offers section.

## Trigger
- User selects the create-offer floating action button.

## Requirements
- `OFFERS.NAV.ADD.001-R1`: The system shall navigate to the Add Offer view when the create-offer floating action button is selected, in both the standard and immersive presentations.
- `OFFERS.NAV.ADD.001-R2`: The create action shall not be presented as a destination in the shared bottom navigation.
- `OFFERS.NAV.ADD.001-R3`: Only one create-offer action shall be visible at a time.
- `OFFERS.NAV.ADD.001-R4`: The create action shall open the Add Offer view in create mode with no offer identifier, regardless of any event value supplied by the trigger.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Create action opens Add Offer view
  Given the user is in Offers view
  When the user selects the create-offer floating action button
  Then the Add Offer view shall be displayed
  And no offer identifier is associated with the view

Scenario: Create action opens Add Offer view from the immersive feed
  Given the user is on the immersive offers feed
  When the user selects the create-offer floating action button
  Then the Add Offer view shall be displayed

Scenario: Create is not a navigation destination
  Given the shared bottom navigation is displayed
  When the user views its destinations
  Then no create-offer destination is present
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

