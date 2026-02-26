# Spec: `ACCOUNT.AUTH.LOGIN.001`

## Metadata
- **Title**: Login View and Authentication
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Login View
- **Priority**: High

## Purpose
Allow an existing user to authenticate from Login view and enter the app flow.

## Preconditions
- User account already exists.
- User is not authenticated.

## Trigger
- User opens `Login` view or submits login credentials.

## Requirements
- `ACCOUNT.AUTH.LOGIN.001-R1`: The system shall provide a dedicated `Login` view with user/email and password inputs.
- `ACCOUNT.AUTH.LOGIN.001-R2`: The `Login` view shall provide a link to the `Create User` view.
- `ACCOUNT.AUTH.LOGIN.001-R3`: The system shall authenticate valid credentials and start a user session.
- `ACCOUNT.AUTH.LOGIN.001-R4`: After successful login, the system shall navigate to `Offers`.
- `ACCOUNT.AUTH.LOGIN.001-R5`: The system shall reject invalid credentials with a clear error state and keep the user on `Login`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Successful login
  Given a registered user exists
  And the user is on Login view
  When the user submits valid credentials
  Then the user shall be authenticated
  And a session shall be established
  And the Offers view shall be displayed

Scenario: Invalid login
  Given a registered user exists
  And the user is on Login view
  When the user submits invalid credentials
  Then authentication shall fail
  And an error message shall be shown
  And Login view shall remain displayed

Scenario: Login view links to Create User
  Given the user is on Login view
  When the user selects the Create User link
  Then the Create User view shall be displayed
```

## Example Inputs/Outputs
- Example input: valid email and password.
- Expected output: authenticated session state and navigation to `Offers`.

## Edge Cases
- Empty credentials should be rejected.
- Locked or disabled accounts should not be authenticated.

## Non-Functional Constraints
- Login outcome should be returned promptly and not block the UI.

## Related Specs
- `ACCOUNT.AUTH.REGISTER.001`
- `APP.SHELL.001`
- `ACCOUNT.PROFILE.001`
