Feature: Platform-native headers on standard views
  As an authenticated user
  I want each standard view to carry a native header while the immersive feed stays headerless
  So that navigation is familiar and the immersive presentation is undisturbed

  Scenario: Standard views present a platform-native header
    Given the authenticated user is on a standard top-level view
    When the view is rendered
    Then a platform-native header shows that view's title
    And the platform's standard leading affordance is present where one applies
    And no second redundant application-title bar is shown

  Scenario: Each standard view keeps its own local heading
    Given the authenticated user opens Offers, My Account, Suggestions, Favorites or Add Offer
    When each view is rendered
    Then that view's own local heading may remain where it labels distinct content
    And the application title is not shown twice

  Scenario: Offers controls remain reachable beneath the native header
    Given the authenticated user is on the standard Offers view
    When the view is rendered
    Then the presentation-mode control and the help control remain visible
    And the native header shows the Offers title

  Scenario: Header follows the active route
    Given the user moves from a top-level destination to an overlay destination
    When each destination is rendered
    Then the header title changes with the route
    And a back affordance appears on the overlay destination
    And returning to the top-level destination restores its section title

  Scenario: Immersive presentation stays headerless
    Given the authenticated user is on the immersive offers feed
    When the view is rendered
    Then no platform-native header is displayed
    And only its own top bar with application identity, search, help and feed tabs is present

  Scenario: Application identity remains on splash and login
    Given the user has not reached the authenticated shell
    When the splash or login view is rendered
    Then the application identity is still displayed

  Scenario: Long localized title reflows in the native header
    Given a standard view has a long localized title at a large reading size
    When the header is rendered
    Then the title wraps at word boundaries without clipping
    And the header's controls remain visible and tappable
