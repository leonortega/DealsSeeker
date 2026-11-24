# Spec: `ACCOUNT.AUTH.KEYBOARD.001`

## Metadata
- **Title**: Keyboard-Safe Authentication Forms
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Login View, Create User View
- **Priority**: Medium

## Purpose
Keep the focused field visible and the form actionable on Login and Create User when the on-screen keyboard is open, using the same platform-appropriate strategy as the other forms in the application.

## Preconditions
- The user is on the Login view or the Create User view.
- The device displays an on-screen keyboard for a text input in that view.

## Trigger
- A text input in an authentication form receives focus, or the user taps another control while the keyboard is open.

## Requirements
- `ACCOUNT.AUTH.KEYBOARD.001-R1`: The Login and Create User forms shall use the keyboard-avoidance strategy appropriate to the platform's window-resize behavior.
- `ACCOUNT.AUTH.KEYBOARD.001-R2`: When a text input has focus, that input shall remain visible above the on-screen keyboard.
- `ACCOUNT.AUTH.KEYBOARD.001-R3`: Tapping another control while the keyboard is open shall operate that control without requiring a separate keyboard-dismissal tap.
- `ACCOUNT.AUTH.KEYBOARD.001-R4`: Both authentication forms shall use the same strategy on a given platform.
- `ACCOUNT.AUTH.KEYBOARD.001-R5`: The strategy shall not change validation, submission, status messages, accessibility semantics or the brand visual design of either form.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Login form uses the platform keyboard strategy
  Given the user is on the Login view on a platform with an on-screen keyboard
  When a text input receives focus
  Then the form shall apply the keyboard-avoidance strategy appropriate to that platform
  And the focused input shall remain visible above the keyboard

Scenario: Create User form uses the same platform keyboard strategy
  Given the user is on the Create User view on the same platform
  When a text input receives focus
  Then the form shall apply the same keyboard-avoidance strategy as the Login view
  And the focused input shall remain visible above the keyboard

Scenario: Controls remain operable while the keyboard is open
  Given an authentication form has the keyboard open
  When the user taps the submit action or the view-switch link
  Then the tapped control shall act without a separate keyboard-dismissal tap
  And entered text shall remain available

Scenario: Keyboard behavior does not alter form semantics or appearance
  Given the keyboard-avoidance strategy is applied to an authentication form
  When validation or submission produces a result
  Then the result shall be shown with the same message, labels and styling as with the keyboard closed
```

## Example Inputs/Outputs
- Example input: on a platform whose window resizes for the keyboard, the email field receives focus.
- Expected output: the form shrinks so the email field stays visible; the submit action stays reachable.
- Example input: the keyboard is open and the user taps the Create User link.
- Expected output: the Create User view is shown in one tap.

## Edge Cases
- A localized label or error message longer than the source text.
- Large text sizes where the focused input is taller than usual.
- The keyboard opens while the form is already scrolled to its last field.
- A platform that does not resize its window for the keyboard keeps its existing layout behavior.

## Non-Functional Constraints
- No new dependency shall be added solely for keyboard avoidance.
- The behavior shall be expressed through the platform's standard keyboard-avoidance mechanism.

## Related Specs
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `ADD.OFFER.KEYBOARD.001`
- `APP.ACCESSIBILITY.UX.003`
- `APP.SHELL.002`
