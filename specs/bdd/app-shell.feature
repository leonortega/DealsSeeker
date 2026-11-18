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
    And the immersive full-screen offers feed is presented

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

  Scenario: Header places the immersive-view button left of the menu button
    Given the user is authenticated
    And the user is on the Offers view without an open overlay
    When the standard application header is rendered
    Then an immersive-view button is displayed immediately to the left of the menu button
    And the button is labeled `Immersive view` in English and `Modo inmersivo` in Spanish
    And selecting it opens the immersive offers feed

  Scenario: Standard header clears the device status area
    Given the user is authenticated
    And the app is running on a mobile device
    When the standard application header is rendered
    Then the header is positioned below the device system status area
    And the app title, user badge, and menu button do not overlap the system indicators

  Scenario: Android back returns to the previously visited view
    Given the user is authenticated
    And the app is running on an Android device
    And the user has moved from one view to another within the application
    When the user invokes the system back gesture or back button
    Then the previously visited view is visible
    And the application remains open

  Scenario: Android back from the first view leaves the application
    Given the app is running on an Android device
    And the user is on the first view shown after application launch
    And no other view has been visited within the application
    When the user invokes the system back gesture or back button
    Then the application leaves the foreground using the platform default behavior

  Scenario: Android back returns from a destination opened in the immersive feed
    Given the user is authenticated
    And the app is running on an Android device
    And the user is on the immersive offers feed
    When the user opens My Account, Suggestions, Reports, or Add Offer from the immersive feed navigation
    And the user invokes the system back gesture or back button
    Then the immersive offers feed is visible again
    And the application remains open

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
