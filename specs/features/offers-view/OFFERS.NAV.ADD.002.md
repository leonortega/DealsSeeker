# Spec: `OFFERS.NAV.ADD.002`

## Metadata
- **Title**: Create Action Visibility During Overlays
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View, Application Shell
- **Priority**: Medium

## Purpose
Keep the single floating create action from covering overlay controls while an overlay sheet is open.

## Preconditions
- User is authenticated and in the Offers section.
- The create-offer floating action button is available per `OFFERS.NAV.ADD.001`.

## Trigger
- A bottom-sheet overlay opens or closes.

## Requirements
- `OFFERS.NAV.ADD.002-R1`: While an overlay bottom sheet is open, the system shall hide the create-offer floating action button.
- `OFFERS.NAV.ADD.002-R2`: When the last overlay bottom sheet closes, the system shall restore the create-offer floating action button at its prior position.
- `OFFERS.NAV.ADD.002-R3`: Hiding or restoring the create action shall not change Add Offer navigation behavior or create a second create action.
- `OFFERS.NAV.ADD.002-R4`: The behavior shall apply in both standard and immersive presentations and in both themes.
- `OFFERS.NAV.ADD.002-R5`: Overlay dismissal controls shall remain unobstructed while the sheet is open.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Create action hides while a sheet is open
  Given the create-offer floating action button is visible
  When an overlay bottom sheet opens
  Then the create-offer floating action button shall not be displayed
  And the sheet's dismissal control shall be unobstructed

Scenario: Create action returns when the sheet closes
  Given an overlay bottom sheet is open and the create action is hidden
  When the sheet is dismissed
  Then the create-offer floating action button shall be displayed at its prior position
  And selecting it shall still open Add Offer

Scenario: Nested overlays keep the action hidden until the last one closes
  Given an overlay bottom sheet is open
  When a second overlay bottom sheet opens and then closes
  Then the create-offer floating action button shall remain hidden
  And it shall reappear only after the first sheet closes
```

## Example Inputs/Outputs
- Example input: open Help while on Offers.
- Expected output: Help's Close control is fully visible; no floating `+` overlaps it.

## Edge Cases
- A sheet opened while another sheet is already visible.
- Dark theme with a tall sheet at increased text size.
- Switching presentation mode while a sheet is open.

## Non-Functional Constraints
- The create action shall not be remounted or repositioned when restored.

## Related Specs
- `OFFERS.NAV.ADD.001`
- `OFFERS.LAYOUT.001`
- `APP.BOTTOM_SHEET.001`
- `APP.ACCESSIBILITY.UX.001`
