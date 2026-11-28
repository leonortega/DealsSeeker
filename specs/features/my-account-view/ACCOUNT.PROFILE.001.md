# Spec: `ACCOUNT.PROFILE.001`

## Metadata
- **Title**: My Account Profile
- **Version**: `v1.4`
- **Status**: Approved
- **Context/View**: My Account View
- **Priority**: Medium

## Purpose
Allow authenticated users to access their account information and manage the offers they created, presented through Material 3 list rows and dialogs without changing account behavior.

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
- `ACCOUNT.PROFILE.001-R13`: On a mobile viewport, the logout action shall be rendered on its own line directly below the user's email address, aligned to the left edge of the account details.
- `ACCOUNT.PROFILE.001-R14`: Account information, owned-offer items and account actions shall be presented as Material 3 list rows with a consistent leading element, title, supporting text and trailing action structure.
- `ACCOUNT.PROFILE.001-R15`: The owned-offer remove confirmation shall follow a Material 3 dialog pattern with the same `Yes` and `No` actions and the same outcomes as defined by R9–R11.
- `ACCOUNT.PROFILE.001-R16`: The list-row and dialog patterns shall not change authentication, access control, logout placement, Edit and Remove outcomes, or the announced names, roles and states of account actions.

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

Scenario: Logout is placed on its own left-aligned line on mobile
  Given the user is authenticated
  And the user is on My Account on a mobile viewport
  When the account details are rendered
  Then the logout action shall appear on a line below the user's email address
  And the logout action shall be aligned to the left edge of the account details

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

Scenario: Account details and owned offers use consistent Material 3 list rows
  Given the user is authenticated and opens My Account
  When the account details and owned offers are rendered
  Then they shall be presented as Material 3 list rows with a consistent structure
  And each row's action shall keep its announced name, role and state

Scenario: Owned-offer removal uses a Material 3 dialog
  Given an owned offer is listed in My Account
  When the user selects Remove
  Then a Material 3 dialog shall offer Yes and No with the same outcomes as before
  And selecting No shall keep the offer unchanged

Scenario: A long email address keeps its Material 3 row layout
  Given the user has a very long email address and large text scaling
  When account details are rendered
  Then the logout action shall remain on its own left-aligned line
  And the row shall not hide the account actions
```

## Example Inputs/Outputs
- Example input: open My Account while authenticated.
- Expected output: profile data for current user only.
- Example input: select `Edit` on an owned offer.
- Expected output: Add Offer view opens in edit mode with the owned offer data loaded.
- Example input: an owned offer with a long localized title on a phone viewport.
- Expected output: the list row keeps its structure and the Edit and Remove actions remain reachable and announced.

## Edge Cases
- Unauthenticated users should be redirected to login.
- If session becomes invalid while profile loads, session shall be cleared and user shall be redirected to login.
- If the user has not created any offers, the owned-offers section shall show a non-error empty state.
- If an owned offer no longer exists when edit or remove is requested, the system shall show a recoverable error state and keep the user in My Account.
- A very long email address shall not push the logout action off the account details; the logout action remains on its own left-aligned line.
- A long localized row label at 200 percent text size — the row keeps its structure and the trailing action remains reachable.

## Non-Functional Constraints
- Profile data shall load without exposing sensitive fields not needed for UI.
- Owned-offer management actions shall not expose or mutate offers owned by another user.
- Material 3 list rows shall not change the mobile logout placement defined by R13.

## Related Specs
- `APP.LIST.VIRTUALIZATION.001`
- `ACCOUNT.AUTH.LOGIN.001`
- `ACCOUNT.AUTH.REGISTER.001`
- `ACCOUNT.AUTH.INPUT.001`
- `ACCOUNT.SETTINGS.AFFORDANCE.001`
- `APP.THEME.005`
- `APP.SHELL.001`
- `ADD.OFFER.LAYOUT.001`
- `ACCOUNT.PROFILE.AVATAR.001`
- `OFFERS.FAVORITES.001`
