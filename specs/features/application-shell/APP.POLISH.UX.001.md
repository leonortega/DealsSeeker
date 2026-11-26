# Spec: `APP.POLISH.UX.001`

## Metadata
- **Title**: Design-system conformance and dialog recovery
- **Version**: `v1.6`
- **Status**: Approved
- **Context/View**: Application shell, Offers View, My Account, Add Offer, Suggestions, Reports
- **Priority**: Low

## Purpose
Close the remaining design-system and recovery gaps without changing the established visual world.

## Preconditions
- A surface is rendered with the active theme, or a dialog is open, or a form is being edited.

## Trigger
- A map, dialog, form, or primary action is presented or dismissed.

## Requirements
- `APP.POLISH.UX.001-R1`: Embedded map surfaces shall use colors from the active palette and shall not introduce an accent color outside that palette.
- `APP.POLISH.UX.001-R2`: Tapping outside a dialog's content shall dismiss the dialog when dismissing it cannot lose user input.
- `APP.POLISH.UX.001-R3`: A success confirmation shall remain perceivable until the user has had an opportunity to read it before a view transition occurs.
- `APP.POLISH.UX.001-R4`: On platforms that resize the window for the keyboard, text entry shall remain visible while editing.
- `APP.POLISH.UX.001-R5`: The bottommost control in a scrollable view shall not be hidden by display cutouts or system bars.
- `APP.POLISH.UX.001-R6`: Equivalent controls in different views shall use the same placeholder treatment and the same primary-action shape.
- `APP.POLISH.UX.001-R7`: Error status messages shall be visually distinguishable from neutral and success messages, while their meaning shall also be conveyed by text.
- `APP.POLISH.UX.001-R8`: Embedded web documents shall use the application's system sans font stack.
- `APP.POLISH.UX.001-R9`: Every scrollable surface shall keep its bottommost control clear of display cutouts and system bars.
- `APP.POLISH.UX.001-R10`: Search inputs and filter controls shall use the fully rounded pill shape from the Pill Rule, while structural panels keep their 12–28px corners.
- `APP.POLISH.UX.001-R11`: Embedded map surfaces shall be presented within a structurally rounded, 1px-bordered surface using the active palette; the map shall fill that surface edge-to-edge with no padding between the map and its border, and its content shall be clipped to the corner.
- `APP.POLISH.UX.001-R12`: The standard Offers view shall not display scroll indicators while its content is scrolled.
- `APP.POLISH.UX.001-R13`: Raised surfaces shall keep the single soft-shadow vocabulary on both platforms.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Map colors come from the active palette
  Given an embedded map is rendered with the active theme
  When the map draws its background, markers, and pin
  Then every color is drawn from the active palette
  And no additional accent color is introduced

Scenario: A dialog closes when its surroundings are tapped
  Given a non-destructive dialog is open
  When the user taps outside its content
  Then the dialog closes without changing the underlying data

Scenario: Success is seen before navigation
  Given a form has been submitted successfully
  When the success message is shown
  Then the message remains perceivable before the user is moved to another view

Scenario: Keyboard and cutouts do not hide controls
  Given the on-screen keyboard is open or the device has a bottom cutout
  When the user edits the last field of a form
  Then the field and the primary action remain visible

Scenario: Search and filter controls are pills
  Given the standard or immersive Offers view is displayed
  When the search input and filter actions are rendered
  Then they shall use fully rounded corners
  And the surrounding panel shall keep its structural corner radius

Scenario: Embedded map uses the panel corner treatment
  Given an embedded map is rendered in the Offers or Add Offer view
  When the map surface is displayed
  Then it shall sit within a rounded, 1px-bordered surface using the active palette
  And the map shall meet the border with no padding gap
  And the map content shall be clipped to that surface's corners

Scenario: Raised surfaces keep one soft shadow on both platforms
  Given an offer card and a primary action are displayed on iOS and Android
  When the surfaces are rendered
  Then each keeps the single low, soft shadow from the design system
  And no hard-offset or stacked shadow is introduced

Scenario: Standard Offers view has no scroll indicators
  Given the authenticated user is on the standard Offers view
  When the view content is scrolled
  Then no vertical or horizontal scroll indicator shall be displayed
```

## Example Inputs/Outputs
- Example input: a map pin in the light theme.
- Expected output: pin and markers use the palette's danger/accent roles, not a separate red.

## Edge Cases
- A map rendered inside an already bordered panel shall not add a second border.
- A dialog with unsaved input (scrim tap must not discard it).
- A very small viewport with a tall keyboard.
- A localized success message longer than the source text.

## Non-Functional Constraints
- These changes shall preserve the pinned design world and shall not introduce a wide desktop reflow.

## Related Specs
- `APP.BRAND.001`
- `APP.CONFIG.MAPS.001`
- `APP.THEME.001`
- `APP.ACCESSIBILITY.UX.003`
- `SUGGESTIONS.SUBMIT.001`
- `REPORTS.SUBMIT.001`
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.UX.001`
