Feature: Immersive vertical full-screen main page feed
  As a user
  I want the main page to present offers as a vertical full-screen feed
  So that I can browse offers one at a time with left discovery controls and right action controls

  Scenario: Main page renders as vertical full-screen feed
    Given the user is on the Offers main page
    And offers are available
    When the view loads
    Then each offer occupies one full-screen page
    And the user can move vertically between offers
    And the previous grid layout is not used

  Scenario: Left side exposes identity and discovery controls
    Given the main page is displayed
    When the user views the left side of the screen
    Then the application name and logo are visible
    And menu entry points are available
    And search options are available
    And user profile and preferences entry points are available

  Scenario: Offer controls remain available in side rail
    Given an offer page is displayed
    When the user views the offer
    Then favorite, directions, availability voting, and report controls are available in a vertical side rail on the right
    And the open detail control is not available
    And their existing behavior and state are preserved

  Scenario: Description and tags use more control
    Given an offer page with a long description and tags
    When the page is displayed
    Then the description is truncated by default
    And a more control reveals the full description and tags
    And after expansion the more control disappears
    And no back control is provided
    And expanded tags are displayed as inline text prefixed with #

  Scenario: Offer with multiple photos supports photo navigation
    Given an offer page with more than one photo
    When the user presses the left or right arrow keys or scrolls horizontally or uses the bottom-centered photo navigation control
    Then the displayed photo changes
    And a bottom-centered navigation control with left and right arrows and one point per photo is available
    And no scrollbar is displayed

  Scenario: Offer with one photo hides photo navigation
    Given an offer page with one photo
    When the page is displayed
    Then photo navigation affordances are not available

  Scenario: Offer with multiple photos renders each photo as a full-page background
    Given an offer page with more than one photo
    When the page is displayed
    Then each photo is rendered as a full-page background occupying the whole page area
    And the displayed photo is not an empty or collapsed visual

  Scenario: User can try the immersive feed
    Given the user is on the Offers main page
    When the user selects the try immersive feed button
    Then the immersive feed view opens

  Scenario: User can open map from immersive feed
    Given the user is on the immersive feed
    When the user selects the map button
    Then the map view is displayed for the current offers and location context

  Scenario: Header and footer are consolidated on the left
    Given the user is on the immersive feed
    When the view loads
    Then the standard header and bottom navigation bars are not rendered separately
    And their entry points are available in the left section
    And bottom navigation destinations are reachable through the menu
    And preference options are grouped under preferences

  Scenario: Left menu is static and contains map and submenu destinations
    Given the user is on the immersive feed
    When the user scrolls between offers
    Then the left menu remains visible in the same position
    And the map option is available inside the menu
    And no header buttons are rendered
    And footer navigation destinations appear as submenu items inside the menu

  Scenario: Empty feed state
    Given no offers are available
    When the main page loads
    Then an empty-state message is displayed