# Spec: `ACCOUNT.PROFILE.001`

## Metadata
- **Title**: My Account Profile
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: My Account View
- **Priority**: Medium

## Purpose
Allow authenticated users to access their account information.

## Preconditions
- User is authenticated.

## Trigger
- User opens the `My Account` section.

## Requirements
- `ACCOUNT.PROFILE.001-R1`: The system shall display account information for the authenticated user.
- `ACCOUNT.PROFILE.001-R2`: The system shall prevent access to another user's profile data.
- `ACCOUNT.PROFILE.001-R3`: Unauthenticated access to My Account view shall redirect to Login view.
- `ACCOUNT.PROFILE.001-R4`: The system shall provide a logout action from My Account context.
- `ACCOUNT.PROFILE.001-R5`: After logout, the system shall end the active session and navigate to Login view.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Authenticated user views own account
  Given the user is authenticated
  When the user opens My Account
  Then the user account details shall be shown

Scenario: User logs out from My Account
  Given the user is authenticated
  When the user selects logout
  Then the user session shall end
  And the Login view shall be displayed
```

## Example Inputs/Outputs
- Example input: open My Account while authenticated.
- Expected output: profile data for current user only.

## Edge Cases
- Unauthenticated users should be redirected to login.
- If session becomes invalid while profile loads, session shall be cleared and user shall be redirected to login.

## Non-Functional Constraints
- Profile data shall load without exposing sensitive fields not needed for UI.

## Related Specs
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `APP.SHELL.001`
