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

  Scenario: Main menu includes instant language and theme controls
    Given the user is authenticated
    When the user opens the main navigation menu
    Then language-change control is visible
    And theme-change control is visible
    And selecting a language or theme option applies immediately in the current view

  Scenario: Startup splash is displayed before first interactive view
    Given the DealsSeeker mobile application is launchable
    When the user starts the application
    Then a branded splash screen is shown for about 2 seconds
    And the splash screen uses startup animation and smooth exit transition
    And the first view becomes interactive after splash exit

  Scenario: Blocking loading overlay appears while required data is loading
    Given the user is on a view that is waiting for required data
    When a required request is in progress
    Then an animated loading overlay is visible
    And interaction with the underlying view is blocked
    And when loading finishes the overlay disappears
