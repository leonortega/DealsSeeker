Feature: Standard views without a global application header
  As an authenticated user
  I want each view to show only its own content
  So that navigation is cleaner and less redundant

  Scenario: Standard views render without a global application header
    Given the authenticated user is on a standard view
    When the view is rendered
    Then no bar showing the application title and a section label is displayed
    And the view content starts at the view's own heading

  Scenario: Each standard view keeps its own local heading
    Given the authenticated user opens Offers, My Account, Suggestions, Favorites or Add Offer
    When each view is rendered
    Then that view's own heading remains visible
    And no application-title bar precedes it

  Scenario: Offers controls remain reachable without the global header
    Given the authenticated user is on the standard Offers view
    When the view is rendered
    Then the presentation-mode control and the help control remain visible
    And no global application header is displayed

  Scenario: Immersive top bar is unaffected
    Given the authenticated user is on the immersive offers feed
    When the view is rendered
    Then its top bar with the application identity, search, help and feed tabs remains available
    And no standard application header is displayed

  Scenario: Application identity remains on splash and login
    Given the user has not reached the authenticated shell
    When the splash or login view is rendered
    Then the application identity is still displayed
