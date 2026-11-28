Feature: Material 3 app bars on standard views
  As an authenticated user
  I want every standard view to carry a Material 3 app bar while the immersive feed keeps its own top bar
  So that navigation and titles are consistent everywhere

  Scenario: Standard views present a Material 3 app bar
    Given the authenticated user is on a standard top-level view
    When the view is rendered
    Then a Material 3 app bar shows that view's title
    And the platform's standard leading affordance is present where one applies
    And no platform-native header or second redundant application-title bar is shown

  Scenario: Each standard view keeps its own local heading
    Given the authenticated user opens Offers, My Account, Suggestions, Favorites or Add Offer
    When each view is rendered
    Then that view's own local heading may remain where it labels distinct content
    And the application title is not shown twice

  Scenario: Offers controls remain reachable in the app bar
    Given the authenticated user is on the standard Offers view
    When the view is rendered
    Then the presentation-mode control and the help control remain visible
    And the Material 3 app bar shows the Offers title

  Scenario: App bar follows the active route
    Given the user moves from a top-level destination to an overlay destination
    When each destination is rendered
    Then the app bar title changes with the route
    And a back affordance appears on the overlay destination
    And returning to the top-level destination restores its section title

  Scenario: Immersive presentation stays headerless with its own top bar
    Given the authenticated user is on the immersive offers feed
    When the view is rendered
    Then the immersive top bar is the only top bar
    And its identity, search, help and feed controls remain reachable
    And no Material 3 app bar or platform-native header is rendered

  Scenario: Application identity remains on splash and login
    Given the user has not reached the authenticated shell
    When the splash or login view is rendered
    Then the application identity is still displayed as defined by the brand identity spec

  Scenario: App bar uses Material 3 roles on both platforms
    Given the same view is rendered on iOS and Android
    When the app bar is displayed
    Then it uses the Material 3 app bar pattern with the active M3 roles
    And no platform-native large-title convention or brand override replaces it

  Scenario: Long localized title reflows in the app bar
    Given a standard view has a long localized title at a large reading size
    When the app bar is rendered
    Then the title wraps at word boundaries without clipping
    And the app bar's controls remain visible and tappable
