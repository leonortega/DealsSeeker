# Spec: `APP.POLISH.UX.001`

## Metadata
- **Title**: Design-system conformance, dialog recovery and visual density
- **Version**: `v3.0`
- **Status**: Approved
- **Context/View**: Application shell, Offers View, My Account, Add Offer, Suggestions, Reports
- **Priority**: Low

## Purpose
Close the remaining conformance and recovery gaps with Material 3 shape, elevation and color roles governing visual treatment, while one status surface and established behavior and copy are preserved.

## Preconditions
- A surface is rendered with the active Material 3 scheme, or a dialog is open, or a form is being edited.

## Trigger
- A map, dialog, form, or primary action is presented or dismissed.

## Requirements
- `APP.POLISH.UX.001-R1`: Embedded map surfaces shall use colors from the active Material 3 color roles and shall not introduce a color outside the active scheme, as defined by `APP.THEME.001`.
- `APP.POLISH.UX.001-R2`: Tapping outside a dialog's content shall dismiss the dialog when dismissing it cannot lose user input.
- `APP.POLISH.UX.001-R3`: A success confirmation shall remain perceivable until the user has had an opportunity to read it before a view transition occurs.
- `APP.POLISH.UX.001-R4`: On platforms that resize the window for the keyboard, text entry and its primary action shall remain visible while editing, including inside a visible sheet, and a tap on a visible control shall reach that control rather than being swallowed by keyboard avoidance, as defined by `OFFERS.SEARCH.KEYBOARD.001`.
- `APP.POLISH.UX.001-R5`: The bottommost control in a scrollable view shall not be hidden by display cutouts or system bars.
- `APP.POLISH.UX.001-R6`: Equivalent controls in different views shall use the same placeholder treatment and the same Material 3 component pattern.
- `APP.POLISH.UX.001-R7`: Error status messages shall be visually distinguishable from neutral and success messages through Material 3 semantic roles, while their meaning shall also be conveyed by text.
- `APP.POLISH.UX.001-R8`: Embedded web documents shall use the Material 3 default typeface stack.
- `APP.POLISH.UX.001-R9`: Every scrollable surface shall keep its bottommost control clear of display cutouts and system bars.
- `APP.POLISH.UX.001-R10`: Search inputs and filter controls shall use the Material 3 shape tokens their component patterns specify, including full rounding where Material 3 defines it; structural panels shall use their own M3 shape tokens. No authored pill-only rule or fixed corner range shall apply.
- `APP.POLISH.UX.001-R11`: Embedded map surfaces shall be presented within a Material 3 surface using an M3 shape token and the active outline role; the map shall fill that surface edge-to-edge with no padding between the map and its boundary, and its content shall be clipped to the surface shape.
- `APP.POLISH.UX.001-R12`: The standard Offers view shall not display scroll indicators while its content is scrolled.
- `APP.POLISH.UX.001-R13`: Raised surfaces shall follow Material 3 tonal elevation levels as defined by `DESIGN.md`; no single authored ambient shadow, stacked shadow or hard-offset shadow shall be used.
- `APP.POLISH.UX.001-R14`: In the immersive presentation, recovery and empty-state panels shall render below the top controls and shall not obscure the presentation switch, search or help controls.
- `APP.POLISH.UX.001-R15`: Each view shall present at most one transient status surface at a time, in one consistent location for that presentation; a different action shall not create a second status surface while the first is still present.
- `APP.POLISH.UX.001-R16`: The single status surface shall follow the message lifecycle of `APP.FEEDBACK.001`; it shall be cleared when the user leaves the view or when the condition it describes no longer holds, so that no expired message is left visible.
- `APP.POLISH.UX.001-R17`: Colors shall come from the active Material 3 roles; validation, success, error and status states shall use their M3 semantic roles and shall not introduce a color outside the active scheme. Status meaning shall never be conveyed by color alone. No authored one-accent-per-view limit shall apply.
- `APP.POLISH.UX.001-R18`: A top bar shall use one compact row of labelled controls, and no control or label shall be repeated in a second row; every control required by another spec shall remain separately reachable.
- `APP.POLISH.UX.001-R19`: Forms shall use one consistent vertical rhythm with a single line of guidance per field; guidance, validation text and counters shall be attached to their own field rather than added as separate full-width accent bands.
- `APP.POLISH.UX.001-R20`: Material 3 component defaults shall govern visual treatment; the authored waypoint accent, night-footer surface, pill controls, single ambient shadow and one-row top bar shall not be reapplied as overrides. The single shared status surface and behavior, copy and coordinate privacy shall remain unchanged, as defined by `APP.BRAND.001`.
- `APP.POLISH.UX.001-R21`: Material 3 components used for the status surface, dialogs and sheets shall keep the single-status and guarded-dismissal rules of this spec; no component shall introduce a second status surface, and no authored shape, shadow or accent language shall override its defaults.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Map colors come from the active Material 3 roles
  Given an embedded map is rendered with the active theme
  When the map draws its background, markers, and pin
  Then every color comes from the active Material 3 roles
  And no color outside the active scheme is introduced

Scenario: A dialog closes when its surroundings are tapped
  Given a non-destructive dialog is open
  When the user taps outside its content
  Then the dialog closes without changing the underlying data

Scenario: Success is seen before navigation
  Given a form has been submitted successfully
  When the success message is shown
  Then the message remains perceivable before the user is moved to another view

Scenario: Error status is visually distinct
  Given a form submission has failed
  When the error status is displayed
  Then it uses the Material 3 semantic error roles in a visually distinct way
  And its meaning is also conveyed by the message text

Scenario: Embedded web documents share the app font stack
  Given an embedded document is rendered
  When the document is loaded
  Then it uses the Material 3 default typeface stack

Scenario: Keyboard and cutouts do not hide controls
  Given the on-screen keyboard is open or the device has a bottom cutout
  When the user edits the last field of a form or a sheet input
  Then the field, its primary action and the sheet's primary action remain visible

Scenario: Keyboard avoidance does not swallow taps
  Given a sheet is visible with the on-screen keyboard open
  When the user taps a visible sheet control
  Then the tap reaches that control
  And no visible control is skipped by the keyboard-avoidance behavior

Scenario: Search and filter controls use Material 3 shape tokens
  Given the standard or immersive Offers view is displayed
  When the search input and filter actions are rendered
  Then each uses the shape token its Material 3 component pattern specifies
  And full rounding is used only where Material 3 defines it
  And structural panels use their own M3 shape tokens

Scenario: Embedded map uses the Material 3 surface treatment
  Given an embedded map is rendered in the Offers or Add Offer view
  When the map surface is displayed
  Then it sits within a Material 3 surface using an M3 shape token and the active outline role
  And the map meets the boundary with no padding gap
  And the map content is clipped to that surface's shape

Scenario: Recovery panels sit below immersive top controls
  Given the immersive offers feed shows a no-results or search-error state
  When the view is rendered
  Then the state panel appears below the presentation switch and search controls
  And the top controls remain unobscured and reachable

Scenario: Raised surfaces use Material 3 tonal elevation
  Given an offer card and a primary action are displayed on iOS and Android
  When the surfaces are rendered
  Then each uses the tonal elevation its Material 3 pattern specifies
  And no authored ambient, stacked or hard-offset shadow is introduced

Scenario: Standard Offers view has no scroll indicators
  Given the authenticated user is on the standard Offers view
  When the view content is scrolled
  Then no vertical or horizontal scroll indicator shall be displayed

Scenario: One status surface serves the whole view
  Given a view has produced a status message
  When a different action produces another status message in the same view
  Then only one status surface is present
  And it occupies the same location used by the first message
  And no competing status banner is shown

Scenario: An expired status message is not left visible
  Given a status message describes an action whose outcome has since changed
  When the user returns to that view
  Then no expired message is displayed
  And the current state is reflected instead

Scenario: Colors follow Material 3 roles without a one-accent limit
  Given a view displays a primary action and a status message
  When the surfaces are rendered
  Then each color comes from the active Material 3 roles
  And the status message uses its M3 semantic role and text
  And no color outside the active scheme is introduced

Scenario: Top bar uses one compact row
  Given the Offers app bar is displayed
  When its controls are rendered
  Then the help, search and presentation controls appear in one row
  And no control or label is repeated in a second row
  And each control remains separately reachable

Scenario: Forms keep guidance attached to each field
  Given a form field has guidance and a validation message
  When the field is rendered
  Then the guidance and validation are attached to that field
  And no full-width accent band duplicates them

Scenario: Material components govern shape and elevation
  Given platform Material 3 components render a primary action, a search control, a card and the navigation surface
  When the surfaces are compared with the design system
  Then M3 shape tokens, tonal elevation and active color roles are used
  And no authored pill, waypoint accent, night footer or ambient shadow is reapplied

Scenario: Component defaults do not duplicate the status surface
  Given a Material status surface, dialog or sheet is used for feedback
  When a second action produces another status message
  Then only one status surface remains
  And the message lifecycle and guarded dismissal are unchanged
```

## Example Inputs/Outputs
- Example input: a map pin in the light appearance of a seed variant.
- Expected output: pin and markers use M3 role colors, not a separate authored red.
- Example input: an embedded map inside an already shaped Material surface.
- Expected output: no second boundary is added and the map content is clipped to the M3 shape.

## Edge Cases
- Two controls in one view each produce a status message; only one Material 3 status surface remains.
- A map rendered inside an already bounded Material surface shall not add a second boundary.
- A dialog with unsaved input (scrim tap must not discard it).
- A very small viewport with a tall keyboard and a suggestion strip.
- A localized success message longer than the source text.
- A sheet input under a tall keyboard where the primary action would otherwise be clipped.
- A transient status message and an inline field error present at once — the single status surface carries the transient message while the inline error stays attached to its field.
- Localized status text wrapping to several lines — one surface grows instead of spawning a second one.
- Reduced density at 200 percent text scaling — controls remain tappable and no required control is dropped.
- A form field carrying a counter, guidance and an error at the same time — all remain attached and readable.
- A former pill or single-shadow rule would override an M3 component default; the M3 default wins.

## Non-Functional Constraints
- These changes shall not introduce a wide desktop reflow and shall preserve behavior, copy and coordinate privacy.
- Density reductions shall not remove any control required by another spec, and shall not weaken the accessibility of any status message.

## Related Specs
- `APP.BRAND.001`
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
- `APP.THEME.001`
- `APP.TYPOGRAPHY.001`
- `APP.FEEDBACK.001`
- `APP.HELP.SEARCH.001`
- `APP.DRAFT.RECOVERY.001`
- `OFFERS.UX.002`
- `APP.HELP.001`
- `APP.HELP.CONTEXTUAL.001`
- `APP.RESILIENCE.UX.001`
- `APP.CONFIG.MAPS.001`
- `APP.ACCESSIBILITY.UX.003`
- `SUGGESTIONS.SUBMIT.001`
- `REPORTS.SUBMIT.001`
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.UX.001`
- `OFFERS.SEARCH.KEYBOARD.001`
- `APP.BOTTOM_SHEET.001`
- `APP.SYMBOL.VOCABULARY.001`
