# Spec: `ACCOUNT.AUTH.REGISTER.001`

## Metadata
- **Title**: Create User View and Registration
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Create User View
- **Priority**: High

## Purpose
Allow a new user to create an account from a dedicated Create User view.

## Preconditions
- User is not authenticated.

## Trigger
- User opens `Create User` view or submits registration data.

## Requirements
- `ACCOUNT.AUTH.REGISTER.001-R1`: The system shall provide a dedicated `Create User` view with required fields.
- `ACCOUNT.AUTH.REGISTER.001-R2`: The system shall validate email format before accepting registration.
- `ACCOUNT.AUTH.REGISTER.001-R3`: The system shall validate strong password policy before accepting registration.
- `ACCOUNT.AUTH.REGISTER.001-R4`: The system shall create a new user account when registration data is valid.
- `ACCOUNT.AUTH.REGISTER.001-R5`: The system shall prevent duplicate account creation for the same unique identifier.
- `ACCOUNT.AUTH.REGISTER.001-R6`: After successful user creation, the system shall authenticate the user and navigate to `Offers`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Successful registration
  Given a new user provides valid registration data
  And the user is on Create User view
  When the user submits the create-user form
  Then the account shall be created
  And a session shall be established
  And the Offers view shall be displayed

Scenario: Duplicate registration is rejected
  Given an account already exists for the submitted unique identifier
  And the user is on Create User view
  When the user submits the create-user form
  Then the registration shall be rejected
  And a duplicate-account message shall be shown

Scenario: Invalid email is rejected
  Given the user is on Create User view
  When the user submits a malformed email
  Then registration shall be rejected
  And an email validation error shall be shown

Scenario: Weak password is rejected
  Given the user is on Create User view
  When the user submits a password that does not meet strong policy
  Then registration shall be rejected
  And a password validation error shall be shown
```

## Example Inputs/Outputs
- Example input: valid display name, valid email, and strong password.
- Expected output: created user account, active session, and navigation to `Offers`.

## Edge Cases
- Missing required fields should be rejected.
- Weak password should be rejected by policy.

## Non-Functional Constraints
- Registration errors should be explicit and actionable.

## Related Specs
- `ACCOUNT.AUTH.LOGIN.001`
- `APP.SHELL.001`
- `ACCOUNT.PROFILE.001`
