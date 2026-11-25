Feature: Application shell and session-aware landing
  As a user
  I want consistent app navigation on startup
  So that I can access all sections quickly

  Scenario: App starts at Login when no session exists
    Given the DealsSeeker mobile application is launchable
    And there is no active authenticated session
    When the user starts the application
    Then the main navigation shows My Account, Offers, and Suggestions
    And Login is the first visible view

  Scenario: App starts at Offers when session exists
    Given the DealsSeeker mobile application is launchable
    And there is an active authenticated session
    When the user starts the application
    Then Offers is the first visible view
    And the Feed presentation is selected in the Offers header mode control

  Scenario: App starts at Login when persisted session is expired
    Given the DealsSeeker mobile application is launchable
    And there is a persisted authenticated session on device
    And the persisted session is expired
    When the user starts the application
    Then the persisted session is cleared
    And Login is the first visible view

  Scenario: Suggestions and offer report successful submit redirects to Offers
    Given the user is authenticated
    And the user is in Suggestions view or an offer-scoped report overlay
    When the user submits with valid data
    And the response is successful with no errors
    Then the success confirmation is perceivable before the redirect
    And the app redirects to Offers view

  Scenario: User leaves before the delayed success redirect
    Given a successful submission has produced a confirmation and a pending delayed redirect
    When the user navigates to another destination before that redirect occurs
    Then the pending redirect is cancelled
    And the user's chosen destination remains visible

  Scenario: No duplicate presentation control in the header or hero
    Given the user is authenticated
    And the user is on the Offers view without an open overlay
    When the standard header and the Offers hero area are rendered
    Then no presentation control is duplicated in the header outside the mode control
    And no presentation control is displayed in the hero area

  Scenario: Standard header clears the device status area
    Given the user is authenticated
    And the app is running on a mobile device
    When the standard application header is rendered
    Then the header is positioned below the device system status area
    And the app title and user badge do not overlap the system indicators

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
    When the user opens My Account or Suggestions from the shared navigation, an offer report overlay, or Add Offer from the create action
    And the user invokes the system back gesture or back button
    Then the immersive offers feed is visible again
    And the application remains open

  Scenario: Standard header has no menu button
    Given the user is authenticated
    And the user is on any standard view
    When the standard application header is rendered
    Then no Menu button is displayed
    And no hamburger icon toggle is displayed
    And navigation remains available through the bottom footer navigation

  Scenario: All views share the same footer
    Given the user is authenticated
    And the user is on a standard view
    When the footer is rendered
    Then it displays My Account, Suggestions, and Offers in that order
    And each destination uses an icon from the same authored monochrome set
    And the footer is present in every view
    And at most one destination is highlighted at a time
    And opening an overlay highlights only the option that opened it
    And selecting Offers opens the standard offers view
    And no create-offer destination is displayed in the footer
    And no presentation-switch destination is displayed in the footer
    And no back control is displayed in any view

  Scenario: Immersive view uses the same footer
    Given the user is authenticated
    And the user is on the immersive offers feed
    When the footer is rendered
    Then it displays the same four destinations as the standard view
    And selecting Offers keeps the current presentation selected
    And no presentation-switch destination is displayed in the footer

  Scenario: Mobile footer spans the full screen width
    Given the user is authenticated
    And the user is on a mobile viewport
    When the shared footer is rendered
    Then it spans the full width of the screen
    And all four destinations are fully visible inside the footer
    And the options are evenly distributed across the footer

  Scenario: Mobile footer labels wrap to two centered lines
    Given the user is authenticated
    And the user is on a mobile viewport
    And at least one footer option has a label too long for a single line
    When the shared footer is rendered
    Then the long label wraps to at most two lines
    And every label is centered beneath its icon
    And no label is truncated with an ellipsis

  Scenario: Standard header scrolls with the view content
    Given the user is authenticated
    And the user is in the standard view
    When the user scrolls the active view
    Then the application header scrolls together with the view content
    And the header does not remain pinned to the top of the screen

  Scenario: Selected presentation persists across other views
    Given the user is authenticated
    And the user has selected the Map presentation in the Offers header
    When the user opens Suggestions and returns to Offers
    Then the Map presentation is still selected
    And the mode remains for the current session

  Scenario: Create action is a single floating action button
    Given the user is authenticated
    And the user is on any standard view
    When a create-offer action is rendered
    Then exactly one create-offer floating action button is available
    And selecting it opens the Add Offer view

  Scenario: My Account includes instant language and theme controls
    Given the user is authenticated
    When the user opens My Account
    Then a language-change control is visible
    And a theme-change control is visible
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
