Feature: Account management for user lifecycle
  As a user
  I want to register, login, and access my account with persistent session
  So that I can use personalized app features

  Scenario: Login view links to Create User view
    Given the user is not authenticated
    And the user is on Login view
    When the user selects the Create User link
    Then the Create User view is shown

  Scenario: Login view offers a read-only guest browse entry point
    Given the user is not authenticated
    And the user is on Login view
    When the user selects "Browse nearby without an account"
    Then the read-only Offers view is shown
    And no authenticated session is created

  Scenario: Guest sign-in returns to the prior Offers context
    Given a guest was prompted to sign in from Offers with query "coffee", a 1000 meter radius, the immersive presentation and offer "off-100" open
    When the user submits valid login credentials
    Then the guest session ends and an authenticated session begins
    And the immersive presentation, the query, the radius and offer "off-100" are restored

  Scenario: Failed guest sign-in preserves the guest context
    Given a guest was prompted to sign in from Offers with an active query
    When the user submits invalid login credentials
    Then the guest session remains active
    And the query, radius, presentation mode and open offer are unchanged

  Scenario: Cancelled guest sign-in preserves the guest context
    Given a guest was prompted to sign in from Offers with an active query
    When the user cancels the sign-in prompt
    Then the guest session remains active
    And the query, radius, presentation mode and open offer are unchanged

  Scenario: User creates a new account with valid data
    Given the user is not authenticated
    When the user submits valid create-account data
    Then a new account is created
    And the user is authenticated
    And the Offers view is shown

  Scenario: Create account rejects invalid email
    Given the user is on Create User view
    When the user submits a malformed email
    Then registration is rejected
    And an email validation error is shown

  Scenario: Create account rejects weak password
    Given the user is on Create User view
    When the user submits a weak password
    Then registration is rejected
    And a strong-password validation error is shown

  Scenario: User logs in with valid credentials
    Given the user already has an account
    When the user submits valid login credentials
    Then the user is authenticated
    And the Offers view is shown

  Scenario: Session persists across app relaunch
    Given the user is authenticated
    And the session was previously persisted on device
    When the user launches the app again
    Then the user is not required to login again
    And the Offers view is shown

  Scenario: Expired persisted session leads to the sign-in and guest-browse choices
    Given the user has an expired persisted session on device
    When the user launches the app
    Then the expired session is cleared
    And the first interactive view offers both Login and the read-only "Browse nearby without an account" entry point

  Scenario: Authenticated user opens My Account
    Given the user is authenticated
    When the user opens the My Account section
    Then the user profile information is shown
    And the user's created offers are shown

  Scenario: User logs out from My Account
    Given the user is authenticated
    When the user selects logout from My Account
    Then the user session ends
    And the Login view is shown

  Scenario: Logout is placed on its own left-aligned line on mobile
    Given the user is authenticated
    And the user is on My Account on a mobile viewport
    When the account details are rendered
    Then the logout action appears on a line below the user's email address
    And the logout action is aligned to the left edge of the account details

  Scenario: User edits an owned offer from My Account
    Given the user is authenticated
    And My Account shows an offer created by the user
    When the user selects edit for that offer
    Then the Add Offer view is shown in edit mode
    And the title shown is Edit Offer

  Scenario: User confirms owned offer removal from My Account
    Given the user is authenticated
    And My Account shows an offer created by the user
    When the user selects remove for that offer
    Then a Yes and No confirmation prompt is shown
    When the user selects Yes
    Then the offer is removed from the user's created offers list

  Scenario: User cancels owned offer removal from My Account
    Given the user is authenticated
    And My Account shows an offer created by the user
    When the user selects remove for that offer
    Then a Yes and No confirmation prompt is shown
    When the user selects No
    Then the offer remains in the user's created offers list

  Scenario: Unauthenticated user opens My Account
    Given the user is not authenticated
    When the user opens the My Account section
    Then the Login view is shown
    And the read-only guest browse entry point is available

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
