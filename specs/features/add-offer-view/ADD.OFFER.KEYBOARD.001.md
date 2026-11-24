# Spec: `ADD.OFFER.KEYBOARD.001`

## Metadata
- **Title**: Keyboard-safe Add Offer form
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Add Offer View
- **Priority**: High

## Purpose
Keep the Add Offer form usable when the on-screen keyboard is open, so contributors can type and act without the keyboard hiding the field or swallowing taps.

## Preconditions
- The user is on the Add Offer view in create or edit mode.
- The device displays an on-screen keyboard for a text input in the view.

## Trigger
- A description or location text input receives focus, or the user taps another control while the keyboard is open.

## Requirements
- `ADD.OFFER.KEYBOARD.001-R1`: When a text input has focus, the system shall keep that input visible above the on-screen keyboard.
- `ADD.OFFER.KEYBOARD.001-R2`: Tapping another control while the keyboard is open shall operate that control without requiring a separate keyboard-dismissal tap.
- `ADD.OFFER.KEYBOARD.001-R3`: The layout shall use the keyboard-avoidance strategy appropriate to the platform's window-resize behavior.
- `ADD.OFFER.KEYBOARD.001-R4`: This behavior shall apply to both create mode and edit mode, and shall preserve the safe-area padding at the bottom of the form.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Typing in the description keeps the field visible
  Given the user is on the Add Offer view
  When the description input receives focus and the on-screen keyboard appears
  Then the description input remains visible above the keyboard
  And the form can still be scrolled to reach later controls

Scenario: Tapping a location suggestion while typing
  Given the location search input has focus and the keyboard is open
  And at least one suggestion is shown
  When the user taps a suggestion
  Then the suggestion is selected in one tap
  And the keyboard no longer blocks the selected location label

Scenario: Keyboard-safe layout in edit mode
  Given the user opens Add Offer view in edit mode for a user-owned offer
  When the description input receives focus and the keyboard appears
  Then the prefilled description remains visible above the keyboard
  And the bottom safe-area padding is preserved
```

## Example Inputs/Outputs
- Example input: user focuses the location search field on a phone while the keyboard covers the lower half of the screen.
- Expected output: the search field stays visible; tapping a result selects it on the first tap.

## Edge Cases
- A localized label or suggestion longer than the source text.
- Large text sizes where the focused input is taller than usual.
- The keyboard opens while the form is scrolled to the bottom.
- Web has no on-screen keyboard; the form keeps its existing scrolling behavior.

## Non-Functional Constraints
- The keyboard behavior shall not change the validation, submission, or coordinate-privacy rules.

## Related Specs
- `ADD.OFFER.LAYOUT.001`
- `ADD.OFFER.UX.001`
- `ACCOUNT.AUTH.KEYBOARD.001`
