# Spec: `ACCOUNT.AUTH.INPUT.001`

## Metadata
- **Title**: Authentication Input Affordances
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: My Account (Login and Register)
- **Priority**: Medium

## Purpose
Make email and password entry self-describing on mobile without changing authentication behavior.

## Preconditions
- User is on the Login or Register view.

## Trigger
- An authentication text input is rendered or its visibility control is used.

## Requirements
- `ACCOUNT.AUTH.INPUT.001-R1`: The email input shall use the device email keyboard and shall not capitalize input automatically.
- `ACCOUNT.AUTH.INPUT.001-R2`: The password input shall mask its characters by default.
- `ACCOUNT.AUTH.INPUT.001-R3`: The password input shall provide a labelled visibility control that reveals and hides the entered characters.
- `ACCOUNT.AUTH.INPUT.001-R4`: The visibility control shall expose its current state to assistive technology.
- `ACCOUNT.AUTH.INPUT.001-R5`: Revealing a password shall not change validation or submission behavior.
- `ACCOUNT.AUTH.INPUT.001-R6`: The behavior shall be identical on Login and Register and in both themes.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Email input uses the email keyboard
  Given the user is on Login or Register
  When the email input is rendered
  Then it shall use the device email keyboard
  And automatic capitalization shall be disabled

Scenario: Password starts hidden and can be revealed
  Given a password has been entered
  When the user selects the password visibility control
  Then the characters shall become visible
  And the control shall announce that it hides the password
  When the user selects it again
  Then the characters shall be masked again

Scenario: Revealing does not change submission
  Given a valid email and password are entered
  When the user reveals the password and submits
  Then authentication shall behave as with a masked password
```

## Example Inputs/Outputs
- Example input: type a password, then select "Show password".
- Expected output: characters become visible; the control label becomes "Hide password".

## Edge Cases
- Empty password with the visibility control selected.
- Localized labels longer than the English text.
- Large text scaling with the control beside the input.

## Non-Functional Constraints
- No new dependency shall be added for the visibility control.

## Related Specs
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `ACCOUNT.AUTH.KEYBOARD.001`
- `APP.ACCESSIBILITY.UX.002`
