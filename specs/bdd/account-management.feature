Feature: Account management for user lifecycle
  As a user
  I want to register, login, and access my account with persistent session
  So that I can use personalized app features

  Scenario: Login view links to Create User view
    Given the user is not authenticated
    And the user is on Login view
    When the user selects the Create User link
    Then the Create User view is shown

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

  Scenario: Expired persisted session redirects to Login
    Given the user has an expired persisted session on device
    When the user launches the app
    Then the expired session is cleared
    And the Login view is shown

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
