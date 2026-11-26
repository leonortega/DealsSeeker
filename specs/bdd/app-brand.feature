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

  Scenario: Standard Offers view shows the mark beside the presentation switch
    Given the authenticated user is on the standard Offers (map) view
    When the presentation switch is rendered
    Then the symbol mark is displayed immediately to its left
    And the mark is not part of the switch itself

  Scenario: Map-view controls mirror the feed top bar
    Given the authenticated user is on the standard Offers (map) view
    When the top controls are rendered
    Then the symbol mark sits in a rounded tile at the left
    And the presentation switch is centered and the help control is at the right
    And the controls row is pinned at the same top position as the immersive feed top bar
    And the row aligns to the same screen edges as the immersive feed top bar
    And the symbol mark and help control are not clipped by the screen edges

  Scenario: Map-view header reuses the feed header structure without search
    Given the authenticated user is on the standard Offers (map) view
    When the top bar is rendered
    Then it uses the same slots and spacing as the immersive feed top bar
    And the search slot keeps its footprint
    And no search control is displayed

  Scenario: Map-view title clears the controls row
    Given the authenticated user is on the standard Offers (map) view
    When the view content is rendered
    Then the title starts below the controls row with a clear gap
    And no top-bar control is clipped by the screen edges

  Scenario: Native launcher icon uses the symbol with contrast
    Given the application is installed on an Android device
    When the launcher icon and its adaptive layers are rendered
    Then the symbol mark appears in a contrasting color on the brand background
    And the adaptive foreground contrasts with the adaptive background

  Scenario: Splash uses only the stacked lockup
    Given the application is showing its in-app splash view
    When the splash is rendered
    Then only the stacked lockup is displayed as the brand identity
    And no second logo or symbol tile is displayed
    And no separate application-title, subtitle or `DealsSeeker mobile` text is displayed
