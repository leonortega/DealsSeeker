# Spec: `APP.BOTTOM_SHEET.001`

## Metadata
- **Title**: Native Bottom-Sheet Behavior for Overlays
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell, Offers overlays
- **Priority**: Low

## Purpose
Give the application's focused sub-tasks one native bottom-sheet interaction — drag, snap and swipe dismissal — keep their input usable above the on-screen keyboard, and keep all visible content brand-styled and identical on both platforms.

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
- `APP.BOTTOM_SHEET.001-R12`: While a sheet is open, the native bottom navigation and its Create action shall not render above the sheet, and every sheet control including its primary action shall remain visible and reachable.
- `APP.BOTTOM_SHEET.001-R13`: While a sheet is visible, the focused text input and the sheet's primary action shall stay above the on-screen keyboard or IME, and a tap on any visible sheet control shall be delivered to that control rather than swallowed by the keyboard-avoidance behavior, as defined by `OFFERS.SEARCH.KEYBOARD.001`.
- `APP.BOTTOM_SHEET.001-R14`: This sheet system shall be the only modality used for focused sub-tasks; no sub-task shall introduce a separate full-screen modal or a second overlay pattern, as defined by `APP.MODALITY.UNIFICATION.001`.

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

Scenario: Sheet controls are not covered by the native bottom navigation
  Given the native bottom navigation is visible on an authenticated view
  When an overlay sheet opens
  Then the footer and its Create action shall not be displayed above the sheet
  And every sheet control including its primary action shall remain visible and tappable

Scenario: A visible sheet keeps its input and primary action above the keyboard
  Given a sheet with a text input is visible
  And the on-screen keyboard is open
  When the input is focused
  Then the input and the primary action remain visible above the keyboard
  And the sheet keeps its snap points and brand styling

Scenario: Taps reach sheet controls while the keyboard is open
  Given a sheet is visible with the on-screen keyboard open
  When the user taps a visible sheet control
  Then the tap is delivered to that control
  And no tap is swallowed by keyboard avoidance

Scenario: Every focused sub-task uses the one sheet system
  Given help, detail, comments, search and first-run guidance are available
  When each is opened
  Then each uses this sheet system
  And none introduces a separate full-screen modal or a second overlay pattern
```

## Example Inputs/Outputs
- Example input: open Help and drag the sheet down.
- Expected output: Help closes through its normal dismissal path; no visual restyle.
- Example input: open the immersive search sheet and focus its input while the keyboard is shown.
- Expected output: the input and primary search action stay above the keyboard and taps reach them.

## Edge Cases
- A drag that ends before the dismissal threshold — the sheet returns to its snap point.
- Rapid repeated drags — dismissal runs once.
- Large text sizes where content exceeds one snap point.
- A sheet opened while another overlay is already visible.
- A sheet opened while the native bottom navigation is visible, in either presentation, with a long localized label.
- A tall keyboard with a suggestion strip on a short viewport — the input and primary action remain visible and the snap points do not change.
- A sub-task opened while a native route is displayed — it still uses this sheet system and does not become a full-screen modal.

## Non-Functional Constraints
- Sheet behavior shall remain platform-native; sheet visuals shall stay brand-defined.
- No new visual component library shall be adopted beyond the sheet behavior dependency.

## Related Specs
- `APP.HELP.CONTEXTUAL.001`
- `APP.SHELL.002`
- `OFFERS.FILTER.SIMPLIFICATION.001`
- `APP.SHELL.003`
- `APP.HAPTICS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `OFFERS.COMMENTS.001`
- `REPORTS.SHEET.001`
- `APP.HELP.001`
- `OFFERS.NAV.ADD.002`
- `APP.MODALITY.UNIFICATION.001`
- `OFFERS.SEARCH.KEYBOARD.001`
- `APP.POLISH.UX.001`
- `APP.PLATFORM.CHROME.001`
- `APP.ONBOARD.001`
- `OFFERS.SEARCH.001`
