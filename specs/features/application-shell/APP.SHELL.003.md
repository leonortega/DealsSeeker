# Spec: `APP.SHELL.003`

## Metadata
- **Title**: Native Modal Behavior for Overlay Destinations
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define that overlay destinations use platform-native modal behavior while their content and dismissal safeguards remain brand-defined and behavior-preserving.

## Preconditions
- The authenticated user is on any standard view.
- An overlay destination (`Add Offer`, `Favorites`) can be opened from the shell.

## Trigger
- The user opens or dismisses an overlay destination.

## Requirements
- `APP.SHELL.003-R1`: The Add Offer view shall be presented with platform-native modal behavior: sheet-style semantics on iOS and full-screen modal semantics on Android.
- `APP.SHELL.003-R2`: The modal content shall use the brand visual system unchanged; no platform-native visual adaptation shall be applied.
- `APP.SHELL.003-R3`: Platform-initiated dismissal (system back, edge swipe or swipe-down gesture, as available on the platform) shall be routed through the same cancel path as the in-app Cancel action.
- `APP.SHELL.003-R4`: When the Add Offer draft has unsaved edits, platform-initiated dismissal shall show the existing discard confirmation and shall not discard data silently.
- `APP.SHELL.003-R5`: Cancelling a modal shall return the user to the underlying view with its state preserved; this includes the offers search query and radius.
- `APP.SHELL.003-R6`: The Favorites destination shall use native stack push/pop behavior with brand chrome, not modal behavior.
- `APP.SHELL.003-R7`: No platform-native close control shall be added inside the brand UI beyond what the operating system itself provides.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Add Offer opens with native modal behavior
  Given the authenticated user is on a standard view
  When the user opens Add Offer
  Then platform-native modal behavior shall be used
  And the Add Offer content shall render with unchanged brand styling

Scenario: Platform dismissal with no unsaved edits
  Given the Add Offer draft has no unsaved edits
  When the user invokes a platform dismissal gesture
  Then the modal shall close and the previous view shall be shown
  And the previous view state shall be preserved

Scenario: Platform dismissal with unsaved edits
  Given the Add Offer draft has unsaved edits
  When the user invokes a platform dismissal gesture or system back
  Then the discard confirmation shall be shown
  And no draft data shall be discarded before confirmation

Scenario: Favorites uses native stack behavior
  Given the authenticated user opens Favorites
  When the user closes Favorites with system back
  Then native pop behavior shall return to the previous view
  And brand chrome shall remain visible

Scenario: No foreign close control appears in the brand UI
  Given an overlay destination is open
  When the modal content is rendered
  Then no platform-native close button shall be drawn inside the brand-styled content
```

## Example Inputs/Outputs
- Example input: Open Add Offer, type a description, then invoke the platform back gesture.
- Expected output: Discard confirmation appears; draft remains until confirmed.
- Example input: Open Favorites, then invoke system back.
- Expected output: Native pop returns to the previous destination.

## Edge Cases
- Dismissal is invoked while a save is in progress; the modal shall not close until the save resolves, then follow its result.
- The device rotates while a modal is open; the modal shall remain open and brand-styled.
- A platform cannot provide swipe-down dismissal; system back shall still follow the cancel path.
- A low-memory event recreates the underlying view; returning from a modal shall not lose the specified view state.

## Non-Functional Constraints
- Modal transitions shall respect the OS animation setting without changing brand visuals.
- No new dependency shall be added solely to render modal visuals.

## Related Specs
- `APP.SHELL.001`
- `APP.SHELL.002`
- `APP.SHELL.004`
- `ADD.OFFER.EXIT.001`
- `ADD.OFFER.UX.001`
- `APP.LIFECYCLE.001`
- `APP.ACCESSIBILITY.UX.004`
- `APP.BOTTOM_SHEET.001`
