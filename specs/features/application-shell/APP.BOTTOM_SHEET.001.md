# Spec: `APP.BOTTOM_SHEET.001`

## Metadata
- **Title**: Native Bottom-Sheet Behavior for Overlays
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, Offers overlays
- **Priority**: Low

## Purpose
Give the application's modal overlays native bottom-sheet interaction — drag, snap and swipe dismissal — while keeping all visible content brand-styled and identical on both platforms.

## Preconditions
- The user has opened an overlay surface (help, offer detail, comments or search).
- The application runs on iOS or Android.

## Trigger
- An overlay surface opens, is dragged, or is dismissed by a swipe-down gesture.

## Requirements
- `APP.BOTTOM_SHEET.001-R1`: Overlay surfaces shall use native bottom-sheet interaction behavior.
- `APP.BOTTOM_SHEET.001-R2`: A bottom sheet shall expose at least one resting snap point and a dismiss gesture.
- `APP.BOTTOM_SHEET.001-R3`: Sheet content shall keep the existing brand palette, typography, shapes and copy; no platform-native visual adaptation shall be applied.
- `APP.BOTTOM_SHEET.001-R4`: Swipe-down dismissal shall follow the same dismissal rules as the overlay's existing close action.
- `APP.BOTTOM_SHEET.001-R5`: Where an overlay has a discard guard, a swipe-down shall not bypass it.
- `APP.BOTTOM_SHEET.001-R6`: Sheet behavior shall not change validation, submission or navigation outcomes.
- `APP.BOTTOM_SHEET.001-R7`: If a device or platform cannot provide sheet behavior, the overlay shall still open and close through its existing controls.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Overlay opens as a native sheet
  Given the user opens an overlay surface
  When the sheet is rendered
  Then it shall rest at a defined snap point
  And its content shall keep the existing brand styling

Scenario: Swipe-down dismisses an overlay
  Given an overlay sheet is open
  When the user drags it down past the dismissal point
  Then the overlay shall close through its normal dismissal path

Scenario: Swipe-down cannot bypass a discard guard
  Given an overlay with unsaved edits is open
  When the user swipes the sheet down
  Then the existing discard confirmation shall be shown
  And no data shall be discarded silently

Scenario: Sheet behavior does not change outcomes
  Given an overlay sheet is open
  When the user completes its primary action
  Then validation, submission and navigation shall behave as before

Scenario: Platform without sheet support
  Given the platform cannot provide native sheet behavior
  When an overlay is opened
  Then its existing close control shall still work
```

## Example Inputs/Outputs
- Example input: open Help and drag the sheet down.
- Expected output: Help closes through its normal dismissal path; no visual restyle.

## Edge Cases
- A drag that ends before the dismissal threshold — the sheet returns to its snap point.
- Rapid repeated drags — dismissal runs once.
- Large text sizes where content exceeds one snap point.
- A sheet opened while another overlay is already visible.

## Non-Functional Constraints
- Sheet visuals shall remain brand-defined; the library shall provide behavior only.
- No new visual component library shall be adopted beyond the sheet behavior dependency.

## Related Specs
- `APP.SHELL.003`
- `APP.HAPTICS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.COMMENTS.001`
- `APP.HELP.001`
