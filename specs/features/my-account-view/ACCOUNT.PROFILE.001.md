# Spec: `ACCOUNT.PROFILE.001`

## Metadata
- **Title**: My Account Profile
- **Version**: `v1.2`
- **Status**: Approved
- **Context/View**: My Account View
- **Priority**: Medium

## Purpose
Allow authenticated users to access their account information and manage the offers they created.

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
- `ACCOUNT.PROFILE.001-R6`: The system shall display a list of offers created by the authenticated user in My Account view.
- `ACCOUNT.PROFILE.001-R7`: Each owned offer item shall provide `Edit` and `Remove` actions.
- `ACCOUNT.PROFILE.001-R8`: The owned-offers list in My Account view shall not display favorite controls, availability voting controls, or the `Available?` section.
- `ACCOUNT.PROFILE.001-R9`: Selecting `Remove` for an owned offer shall open a confirmation prompt with `Yes` and `No` actions.
- `ACCOUNT.PROFILE.001-R10`: Selecting `No` in the remove confirmation shall keep the offer unchanged.
- `ACCOUNT.PROFILE.001-R11`: Selecting `Yes` in the remove confirmation shall delete the owned offer and remove it from the My Account offer list.
- `ACCOUNT.PROFILE.001-R12`: Selecting `Edit` for an owned offer shall navigate to the Add Offer view in edit mode for that specific offer.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Authenticated user views own account
  Given the user is authenticated
  When the user opens My Account
  Then the user account details shall be shown
  And the user's created offers shall be shown in a dedicated list

Scenario: User logs out from My Account
  Given the user is authenticated
  When the user selects logout
  Then the user session shall end
  And the Login view shall be displayed

Scenario: User removes an owned offer
  Given the user is authenticated
  And My Account shows an offer created by the user
  When the user selects Remove for that offer
  Then a confirmation prompt with Yes and No shall be shown
  When the user selects Yes
  Then the offer shall be removed from the user's owned offers list

Scenario: User cancels owned offer removal
  Given the user is authenticated
  And My Account shows an offer created by the user
  When the user selects Remove for that offer
  Then a confirmation prompt with Yes and No shall be shown
  When the user selects No
  Then the offer shall remain in the user's owned offers list

Scenario: User edits an owned offer
  Given the user is authenticated
  And My Account shows an offer created by the user
  When the user selects Edit for that offer
  Then the Add Offer view shall open in edit mode
  And the view title shall be "Edit Offer"
```

## Example Inputs/Outputs
- Example input: open My Account while authenticated.
- Expected output: profile data for current user only.
- Example input: select `Edit` on an owned offer.
- Expected output: Add Offer view opens in edit mode with the owned offer data loaded.

## Edge Cases
- Unauthenticated users should be redirected to login.
- If session becomes invalid while profile loads, session shall be cleared and user shall be redirected to login.
- If the user has not created any offers, the owned-offers section shall show a non-error empty state.
- If an owned offer no longer exists when edit or remove is requested, the system shall show a recoverable error state and keep the user in My Account.

## Non-Functional Constraints
- Profile data shall load without exposing sensitive fields not needed for UI.
- Owned-offer management actions shall not expose or mutate offers owned by another user.

## Related Specs
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `APP.SHELL.001`
- `ADD.OFFER.LAYOUT.001`
