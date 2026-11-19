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

  Scenario: No view button is displayed in the header or hero
    Given the user is authenticated
    And the user is on the Offers view without an open overlay
    When the standard header and the Offers hero area are rendered
    Then no new-view button is displayed in the header
    And no new-view button is displayed in the hero area
    And the view button is only available in the shared bottom footer

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
    When the user opens My Account, Suggestions, Reports, or Add Offer from the immersive feed navigation
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
    Then it displays My Account with a 👤 icon, Suggestions, Create, Offers with a 💲 icon, and ⭐ New view in that order
    And the footer is present in every view
    And at most one option is highlighted at a time, with the view button never highlighted
    And opening an overlay highlights only the option that opened it
    And selecting Create opens the Add Offer view
    And selecting Offers opens the standard offers view
    And selecting New view opens the immersive offers feed
    And no plus button for creating an offer is displayed in the standard view
    And no back control is displayed in any view

  Scenario: Immersive view uses the same footer with a Map mode label
    Given the user is authenticated
    And the user is on the immersive offers feed
    When the footer is rendered
    Then it displays My Account, Suggestions, Create, Offers, and 🗺️ Map mode in that order
    And selecting Offers keeps the immersive offers view
    And selecting Map mode opens the standard offers view
    And the view button is never highlighted

  Scenario: Mobile footer spans the full screen width
    Given the user is authenticated
    And the user is on a mobile viewport
    When the shared footer is rendered
    Then it spans the full width of the screen
    And all five options including the view button are fully visible inside the footer
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

  Scenario: Selected view mode persists across other views
    Given the user is authenticated
    And the user has selected the immersive view mode
    When the user opens Suggestions and then Add Offer from the footer
    Then only the Add Offer option is highlighted
    And when the user selects Offers in the footer
    Then the immersive offers feed is displayed with the previously selected mode
    And the mode remains until the user selects the view button again

  Scenario: View button redirects to the selected offers mode from another view
    Given the user is authenticated
    And the user is on Suggestions with the standard view mode selected
    When the user selects New view in the footer
    Then the immersive offers feed is displayed
    When the user opens Suggestions again
    And selects Map mode in the footer
    Then the standard offers view is displayed

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
