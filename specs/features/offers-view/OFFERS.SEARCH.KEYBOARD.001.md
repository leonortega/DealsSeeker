# Spec: `OFFERS.SEARCH.KEYBOARD.001`

## Metadata
- **Title**: Immersive Search Sheet Keyboard Avoidance
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (immersive search sheet)
- **Priority**: High

## Purpose
Keep the search input and primary search action usable above the on-screen keyboard/IME and ensure taps on visible sheet controls are never swallowed.

## Preconditions
- The immersive search sheet is open.
- The device shows an on-screen keyboard or IME when a text field is focused.

## Trigger
- The search input receives focus and the keyboard appears, or the user taps a visible sheet control while the keyboard is open.

## Requirements
- `OFFERS.SEARCH.KEYBOARD.001-R1`: When the search input is focused and the keyboard or IME is visible, the input shall remain visible above it.
- `OFFERS.SEARCH.KEYBOARD.001-R2`: The sheet's primary search action shall remain visible and tappable above the keyboard/IME while the input is focused.
- `OFFERS.SEARCH.KEYBOARD.001-R3`: A tap on any visible sheet control while the keyboard is open shall be delivered to that control and shall not be swallowed by the keyboard-avoidance behavior.
- `OFFERS.SEARCH.KEYBOARD.001-R4`: Keyboard avoidance shall not change the sheet's snap points, brand styling, validation or submission outcomes, as defined by `APP.BOTTOM_SHEET.001`.
- `OFFERS.SEARCH.KEYBOARD.001-R5`: The sheet handle, dismiss gesture and any labelled disclosure shall remain reachable while the keyboard is open.
- `OFFERS.SEARCH.KEYBOARD.001-R6`: On a platform that does not resize the content window for the keyboard, the input and primary action shall stay clear of the keyboard/IME through scrolling or inset handling.
- `OFFERS.SEARCH.KEYBOARD.001-R7`: The 200-character input limit from `OFFERS.SEARCH.001-R14` shall still apply while the keyboard is open.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Search input and primary action stay above the keyboard
  Given the immersive search sheet is open
  And the on-screen keyboard is open
  When the search input is focused
  Then the input remains visible above the keyboard
  And the primary search action remains visible above the keyboard

Scenario: Taps reach sheet controls while the keyboard is open
  Given the immersive search sheet is open with the keyboard visible
  When the user taps a visible sheet control
  Then the tap is delivered to that control
  And no tap is swallowed by keyboard avoidance

Scenario: Keyboard avoidance preserves sheet behavior and styling
  Given the immersive search sheet is open
  When the keyboard appears and the sheet adjusts
  Then the sheet keeps its resting snap points
  And its brand palette, type, shapes and copy are unchanged

Scenario: Search submission still works with the keyboard open
  Given the user typed a query in the immersive search sheet
  When the user activates the visible primary search action
  Then validation and submission behave as with the keyboard closed
  And results refresh through the normal search path

Scenario: Dismissal stays reachable with the keyboard open
  Given the immersive search sheet is open with the keyboard visible
  When the user dismisses the sheet through its normal affordance
  Then the sheet closes through its normal dismissal path
  And the keyboard does not block the handle or gesture

Scenario: A tall keyboard with a suggestion strip on a short viewport
  Given the viewport is short and the keyboard shows a suggestion strip
  When the search input is focused
  Then the input and primary action remain visible
  And no visible control is skipped by a tap

Scenario: A platform that does not resize the content window
  Given the platform keeps the content window size when the keyboard opens
  When the search input is focused
  Then the input and primary action are still clear of the keyboard
  And they remain tappable

Scenario: Character limit still applies with the keyboard open
  Given the immersive search input is focused with the keyboard open
  When the user pastes 250 characters
  Then the input holds exactly 200 characters
```

## Example Inputs/Outputs
- Example input: focus the immersive search input on a device with a tall keyboard.
- Expected output: the input and the primary action stay above the keyboard; taps on them register; snap points and styling are unchanged.
- Example input: dismiss the sheet by its normal gesture while the keyboard is up.
- Expected output: the sheet closes through its normal path and the handle or gesture is not blocked.

## Edge Cases
- A short landscape viewport with a suggestion strip.
- Large text sizes that make the primary action taller while the keyboard is open.
- A platform where the keyboard does not resize the content window.
- A labelled disclosure inside the sheet that sits behind the keyboard before adjustment.
- A tap landing exactly on a control that moved during keyboard adjustment.

## Non-Functional Constraints
- The adjustment shall feel immediate and shall not introduce a second modal pattern.
- Existing search validation and result-refresh behavior shall be unchanged.

## Related Specs
- `APP.TYPOGRAPHY.001`
- `OFFERS.SEARCH.RECENTS.001`
- `OFFERS.SEARCH.001`
- `APP.BOTTOM_SHEET.001`
- `APP.POLISH.UX.001`
- `APP.MODALITY.UNIFICATION.001`
