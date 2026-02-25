Feature: Application shell and default landing
  As a user
  I want consistent app navigation on startup
  So that I can access all sections quickly

  Scenario: App shows shell sections and defaults to Offers
    Given the DealsSeeker mobile application is launchable
    When the user starts the application
    Then the main navigation shows My Account, Offers, Suggestions, and Reports
    And Offers is the active default section
