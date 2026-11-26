# Spec: `APP.BOTTOM_SHEET.001`

## Metadata
- **Title**: Native Bottom-Sheet Behavior for Overlays
- **Version**: `v1.4`
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
- `APP.BOTTOM_SHEET.001-R4`: Swipe-down dismissal shall follow the same dismissal rules as the overlay's dismissal path.
- `APP.BOTTOM_SHEET.001-R5`: Where an overlay has a discard guard, a swipe-down shall not bypass it.
- `APP.BOTTOM_SHEET.001-R6`: Sheet behavior shall not change validation, submission or navigation outcomes.
- `APP.BOTTOM_SHEET.001-R7`: If a device or platform cannot provide sheet behavior, the overlay shall still open and close through its existing controls.
- `APP.BOTTOM_SHEET.001-R8`: A sheet that is not visible shall not open the on-screen keyboard or take focus from the current surface.
- `APP.BOTTOM_SHEET.001-R9`: An overlay sheet shall not render a separate Close button that duplicates the native handle and swipe dismissal; dismissal shall remain available through the native affordance and to assistive technology.
- `APP.BOTTOM_SHEET.001-R10`: While a sheet is open, its surface and backdrop shall render above all presenting-view chrome, including headers, presentation switches, filters and transient status banners.
- `APP.BOTTOM_SHEET.001-R11`: System Back while a sheet is open shall dismiss the sheet through its normal dismissal path and shall not affect the underlying view.
- `APP.BOTTOM_SHEET.001-R12`: While a sheet is open, the branded footer navigation and its Create action shall not render above the sheet, and every sheet control including its primary action shall remain visible and reachable.

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

Scenario: A hidden sheet does not open the keyboard
  Given an overlay sheet is mounted but not visible
  When the presenting surface is opened or switched
  Then no on-screen keyboard shall appear
  And focus shall remain on the presenting surface

Scenario: Overlays do not duplicate the native dismissal affordance
  Given an overlay sheet is open
  When the user views its controls
  Then no separate Close button shall be rendered
  And the native handle and swipe dismissal shall remain available

Scenario: Sheet content is not covered by presenting-view chrome
  Given the immersive offers feed is displayed
  And a status banner is visible
  When an overlay sheet opens
  Then the feed's top bar and tabs shall not appear above the sheet
  And the status banner shall not appear above the sheet
  And all sheet content shall remain readable

Scenario: System Back dismisses an open sheet
  Given an overlay sheet is open
  When the user invokes system Back
  Then the sheet shall close through its normal dismissal path
  And the underlying view shall remain unchanged

Scenario: Sheet controls are not covered by the branded footer
  Given the branded footer is visible on an authenticated view
  When an overlay sheet opens
  Then the footer and its Create action shall not be displayed above the sheet
  And every sheet control including its primary action shall remain visible and tappable
```

## Example Inputs/Outputs
- Example input: open Help and drag the sheet down.
- Expected output: Help closes through its normal dismissal path; no visual restyle.

## Edge Cases
- A drag that ends before the dismissal threshold — the sheet returns to its snap point.
- Rapid repeated drags — dismissal runs once.
- Large text sizes where content exceeds one snap point.
- A sheet opened while another overlay is already visible.
- A sheet opened while the branded footer is visible, in either presentation, with a long localized footer label.

## Non-Functional Constraints
- Sheet visuals shall remain brand-defined; the library shall provide behavior only.
- No new visual component library shall be adopted beyond the sheet behavior dependency.

## Related Specs
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.HAPTICS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.COMMENTS.001`
- `REPORTS.SHEET.001`
- `APP.HELP.001`
- `OFFERS.NAV.ADD.002`
