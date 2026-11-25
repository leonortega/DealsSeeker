Feature: Brand logo set and placement
  As a DealsSeeker user
  I want one consistent authored logo across every surface
  So that the app does not show placeholder brand imagery

  Scenario: Splash and login use the authored symbol mark
    Given the user has not reached the authenticated shell
    When the splash or login view is rendered
    Then the symbol mark is displayed as the application identity
    And the localized application name is shown as text
    And no placeholder letter glyph is displayed

  Scenario: Immersive top bar uses the authored symbol mark
    Given the authenticated user is on the immersive offers feed
    When the top bar is rendered
    Then the symbol mark is displayed as the application identity
    And the application name text follows the viewport rule

  Scenario: Native icon surfaces use the authored logo set
    Given the application is installed on a mobile device or opened on the web
    When the app icon, its adaptive layers or the favicon are rendered
    Then they are derived from the authored logo set
    And no placeholder icon is displayed

  Scenario: Native startup image uses the stacked lockup
    Given the application is launching
    When the native startup image is rendered
    Then the stacked lockup is shown
