# Spec: `ACCOUNT.AUTH.LOGIN.001`

## Metadata
- **Title**: Login View and Authentication
- **Version**: `v1.2`
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
- `ACCOUNT.AUTH.LOGIN.001-R4`: After successful login, the system shall navigate to `Offers`, or shall return to the prior Offers context when R7 applies.
- `ACCOUNT.AUTH.LOGIN.001-R5`: The system shall reject invalid credentials with a clear error state and keep the user on `Login`.
- `ACCOUNT.AUTH.LOGIN.001-R6`: The `Login` view shall provide an explicit `Browse nearby without an account` entry point that starts the read-only guest session defined in `OFFERS.GUEST.001` without creating an authenticated session.
- `ACCOUNT.AUTH.LOGIN.001-R7`: When sign-in was entered from a guest contribution prompt, successful login shall return the user to the prior Offers context, restoring the search query, coverage radius, presentation mode and any open offer as defined in `OFFERS.GUEST.001`.
- `ACCOUNT.AUTH.LOGIN.001-R8`: If sign-in from that prompt is cancelled or fails, the system shall keep the guest session active and restore the preserved context.

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

Scenario: Login view offers a read-only guest browse entry point
  Given the user is not authenticated and is on Login view
  When the user selects "Browse nearby without an account"
  Then the read-only Offers view shall be displayed
  And no authenticated session shall be created

Scenario: Successful login from a guest prompt returns to the prior context
  Given a guest was prompted to sign in from Offers with query "coffee", a 1000 meter radius, the immersive presentation and offer "off-100" open
  When the user submits valid credentials
  Then the guest session shall end and an authenticated session shall begin
  And the immersive presentation, the query, the radius and offer "off-100" shall be restored

Scenario: Cancelled or failed login from a guest prompt preserves the guest context
  Given a guest was prompted to sign in from Offers with an active query
  When the user cancels the prompt or submits invalid credentials
  Then the guest session shall remain active
  And the query, radius, presentation mode and open offer shall be unchanged
```

## Example Inputs/Outputs
- Example input: valid email and password.
- Expected output: authenticated session state and navigation to `Offers`.
- Example input: an unauthenticated user selects `Browse nearby without an account` on Login.
- Expected output: read-only Offers view with no authenticated session.
- Example input: a guest prompted from an offer with query `coffee` signs in successfully.
- Expected output: the prior Offers view, query, radius, presentation and open offer are restored.

## Edge Cases
- Empty credentials should be rejected.
- Locked or disabled accounts should not be authenticated.
- A guest sign-in prompt dismissed with the back gesture shall leave the guest context unchanged.
- Sign-in entered directly from Login (not from a guest prompt) shall still navigate to `Offers`.

## Non-Functional Constraints
- Login outcome should be returned promptly and not block the UI.

## Related Specs
- `ACCOUNT.AUTH.REGISTER.001`
- `ACCOUNT.AUTH.INPUT.001`
- `APP.SHELL.001`
- `ACCOUNT.PROFILE.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `ACCOUNT.AUTH.KEYBOARD.001`
- `OFFERS.GUEST.001`
- `OFFERS.EMPTY.001`
