# Spec: `ACCOUNT.AUTH.INPUT.001`

## Metadata
- **Title**: Authentication Input Affordances
- **Version**: `v1.3`
- **Status**: Approved
- **Context/View**: My Account (Login and Register)
- **Priority**: Medium

## Purpose
Make email and password entry self-describing on mobile without changing authentication behavior, using Material 3 labelled text fields with the same validation, autofill and accessibility semantics.

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
- `ACCOUNT.AUTH.INPUT.001-R7`: The email input shall accept at most 254 characters on both Login and Register.
- `ACCOUNT.AUTH.INPUT.001-R8`: The password input shall accept at most 200 characters on both Login and Register.
- `ACCOUNT.AUTH.INPUT.001-R9`: The Register display name input shall accept at most 80 characters.
- `ACCOUNT.AUTH.INPUT.001-R10`: The email and password inputs shall expose platform autofill metadata for username and for current or new password so that password managers can offer stored or generated credentials.
- `ACCOUNT.AUTH.INPUT.001-R11`: Email, password and display-name inputs shall follow a Material 3 labelled text field pattern with a persistent label and a helper or error text line, and the label and any error text shall be announced on focus.
- `ACCOUNT.AUTH.INPUT.001-R12`: The visibility control shall keep its labelled, state-exposing behavior inside the Material 3 input pattern and shall not change keyboard type, capitalization, autofill metadata, length caps, validation or submission defined by R1–R10.

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

Scenario: Authentication inputs stop at their contract maxima
  Given the user is on Login or Register
  When the user pastes an email longer than 254 characters
  Then the email input shall hold exactly 254 characters
  When the user pastes a password longer than 200 characters
  Then the password input shall hold exactly 200 characters
  When the user is on Register and pastes a display name longer than 80 characters
  Then the display name input shall hold exactly 80 characters

Scenario: Auth fields use labelled Material 3 inputs
  Given the user is on Login or Register
  When the email, password and display-name inputs are rendered
  Then each shall show a persistent label and a helper or error text line
  And the label and any error text shall be announced on focus

Scenario: The input pattern preserves autofill and visibility semantics
  Given a password has been entered
  When the visibility control is used inside the labelled input
  Then its current state shall still be announced
  And autofill metadata, length caps and submission behavior shall be unchanged

Scenario: Long localized labels keep the input and control usable
  Given localized labels and helper text longer than the source text at large text scaling
  When the fields are rendered
  Then each label and helper line shall stay with its own field
  And the visibility control shall remain labelled and tappable
```

## Example Inputs/Outputs
- Example input: type a password, then select "Show password".
- Expected output: characters become visible; the control label becomes "Hide password".
- Example input: a validation error on the email field on Register.
- Expected output: the error appears as that field's Material 3 error text line and is announced on focus; autofill and submission are unchanged.

## Edge Cases
- Empty password with the visibility control selected.
- Localized labels longer than the English text.
- Large text scaling with the control beside the input.
- A localized error line with large text — it wraps within the field without covering the visibility control.

## Non-Functional Constraints
- No new dependency shall be added for the visibility control.
- The Material 3 input pattern shall not change autofill metadata or the keyboard type.

## Related Specs
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `ACCOUNT.AUTH.KEYBOARD.001`
- `APP.ACCESSIBILITY.UX.002`
- `ACCOUNT.PROFILE.001`
