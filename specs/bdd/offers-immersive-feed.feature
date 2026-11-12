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
    And search options are available
    And entry points for the main navigation destinations are available

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
    When the user presses the left or right arrow keys or swipes horizontally over the page or uses the photo navigation control
    Then the displayed photo changes
    And a navigation control with one point per photo is available above the offer title, horizontally centered within the offer panel
    And no scrollbar is displayed

  Scenario: Horizontal swipe changes the photo
    Given an offer page with more than one photo
    When the user swipes horizontally over the page
    Then the displayed photo changes to the adjacent photo
    And the active position indicator moves accordingly

  Scenario: Vertical swipe still scrolls between offers
    Given the user is on the immersive offers view
    When the user swipes vertically over an offer page
    Then the feed moves to the adjacent offer page

  Scenario: A short swipe does not change the photo
    Given an offer page with more than one photo
    When the user swipes horizontally over the page by less than the swipe distance threshold
    Then the displayed photo remains unchanged

  Scenario: Offer with one photo hides photo navigation
    Given an offer page with one photo
    When the page is displayed
    Then photo navigation affordances are not available

  Scenario: Offer with multiple photos renders each photo as a full-page background
    Given an offer page with more than one photo
    When the page is displayed
    Then each photo is rendered as a full-page background occupying the whole page area
    And the displayed photo is not an empty or collapsed visual

  Scenario: Left panel offers a create-offer option as the last option
    Given the user is in the immersive feed
    When the user views the left panel
    Then a create-offer option is available as the last option of the left panel
    And the option is labeled `Create` in English and `Crear` in Spanish
    And selecting it opens the Add Offer view

  Scenario: Left panel omits the application menu option and the back option
    Given the user is in the immersive feed
    When the user views the left panel
    Then an application-menu option is not available
    And a back option is not available

  Scenario: Map entry point opens the standard offers view
    Given the user is in the immersive feed
    When the user selects the map entry point
    Then the standard offers view is displayed
    And the map is displayed for the current offers and location context
    And the entry point is labeled `Map mode` in English and `Modo mapa` in Spanish

  Scenario: Immersive feed is the default offers presentation
    Given the application starts with an authenticated session
    When the first view is displayed
    Then the immersive offers feed is displayed

  Scenario: User can try the immersive feed from the header
    Given the user is on the standard Offers view
    When the user selects the immersive-view button in the header
    Then the immersive feed view opens
    And the button is placed immediately to the left of the menu button
    And the button is labeled `Immersive view` in English and `Modo inmersivo` in Spanish

  Scenario: Header and footer are consolidated on the left
    Given the user is on the immersive feed
    When the view loads
    Then the standard header and bottom navigation bars are not rendered separately
    And their entry points are available in the left section
    And bottom navigation destinations are reachable directly through left panel options
    And preference options remain available in the Account destination

  Scenario: Left menu is static and contains map and navigation destinations
    Given the user is on the immersive feed
    When the user scrolls between offers
    Then the left menu remains visible in the same position
    And the map option is available inside the menu
    And no header buttons are rendered
    And footer navigation destinations appear as options inside the menu

  Scenario: Empty feed state
    Given no offers are available
    When the main page loads
    Then an empty-state message is displayed
