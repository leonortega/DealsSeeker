Feature: Application shell and session-aware landing
  As a user
  I want consistent app navigation on startup
  So that I can access all sections quickly

  Scenario: App starts at Login when no session exists
    Given the DealsSeeker mobile application is launchable
    And there is no active authenticated session
    When the user starts the application
    Then the main navigation shows My Account, Offers, Suggestions, and Reports
    And Login is the first visible view

  Scenario: App starts at Offers when session exists
    Given the DealsSeeker mobile application is launchable
    And there is an active authenticated session
    When the user starts the application
    Then Offers is the first visible view

  Scenario: App starts at Login when persisted session is expired
    Given the DealsSeeker mobile application is launchable
    And there is a persisted authenticated session on device
    And the persisted session is expired
    When the user starts the application
    Then the persisted session is cleared
    And Login is the first visible view

  Scenario: Suggestions and Reports successful submit redirects to Offers
    Given the user is authenticated
    And the user is in Suggestions or Reports view
    When the user submits with valid data
    And the response is successful with no errors
    Then the app redirects to Offers view
