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

  Scenario: Top bar exposes identity and discovery controls
    Given the main page is displayed
    When the user views the top bar
    Then the application name and logo are visible
    And search options are available
    And entry points for the main navigation destinations are available in the shared bottom navigation

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
    And a navigation control with one point per photo is available above the offer title, horizontally centered within the visible offer page area
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

  Scenario: Multi-photo offer still allows vertical feed scrolling
    Given an offer page with more than one photo
    And the photo navigation control is displayed
    When the user swipes vertically over that offer page
    Then the feed moves to the adjacent offer page
    And the displayed photo remains unchanged

  Scenario: Immersive top bar clears the device status area
    Given the user is on the immersive offers view on a mobile device
    When the top bar is rendered
    Then it is positioned below the device system status area
    And its filter tabs and search control do not overlap the system indicators

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

  Scenario: Create offer is available from a single floating action button
    Given the user is in the immersive feed
    When the user views the available actions
    Then a single create-offer floating action button is available
    And selecting it opens the Add Offer view
    And no create-offer item is presented as a bottom navigation destination

  Scenario: Immersive view omits the application menu and back controls
    Given the user is in the immersive feed
    When the user views the available controls
    Then an application-menu control is not available
    And a back control is not available

  Scenario: Map option in the header mode control opens the standard offers view
    Given the user is in the immersive feed
    When the user selects the Map option in the Offers header mode control
    Then the standard offers view is displayed
    And the map is displayed for the current offers and location context

  Scenario: Feed is the default presentation on a cold start
    Given the application starts with an authenticated session
    When the first view is displayed
    Then the Feed presentation is selected

  Scenario: Presentation is chosen in the Offers header
    Given the user is on the standard Offers view
    When the user selects the Feed option in the header mode control
    Then the immersive feed view opens
    And no mode control is presented as a bottom navigation destination

  Scenario: Immersive view uses the classic application styling
    Given the user is on the immersive offers view
    When the view is rendered
    Then its text uses the same font family, sizes and weights as the standard application UI
    And its top bar, footer, controls, status banners and search sheet use the same colors and surfaces as the standard application UI
    And the offer text overlay has no surrounding box or opaque background and stays readable over the image

  Scenario: Immersive view follows the active theme
    Given the user is on the immersive offers view
    And the active theme is dark
    When the view is rendered
    Then its surfaces and text use the dark theme colors of the standard application UI
    When the active theme changes to light
    Then its surfaces and text update to the light theme colors of the standard application UI

  Scenario: Unified bottom navigation remains available in immersive
    Given the user is on the immersive feed
    When the view loads
    Then the same bottom navigation as the standard view is displayed
    And main navigation destinations are reachable from that bottom navigation
    And no separate left navigation panel is rendered
    And preference options remain available in the Account destination

  Scenario: Navigation icons use one consistent authored set
    Given the user is on the immersive offers view
    When navigation options are rendered in the bottom navigation
    Then each option uses an icon from the same authored monochrome set
    And no emoji glyph is used as a navigation icon

  Scenario: Immersive chrome stays readable in the light theme
    Given the light theme is active
    And the immersive offers feed is displayed
    When the top-bar title, feed tabs and action captions are rendered over the fixed plum backdrop
    Then each uses a light foreground color with sufficient contrast
    And no text is rendered in dark ink over that backdrop

  Scenario: Presentation control stays compact on a wide screen
    Given the app is running on a tablet-sized screen
    When the immersive top bar is rendered
    Then the presentation control keeps a compact width
    And it does not stretch across the full screen

  Scenario: Offer actions stay reachable at large text size
    Given the system text size is set to 200 percent
    And the immersive offers feed is displayed on a wide screen
    When the side action rail is rendered
    Then every action remains visible and independently tappable
    And no action label overlaps another action
    And no action control is clipped by the screen edge

  Scenario: Immersive feed has no light safe-area band in either theme
    Given the immersive offers feed is displayed
    And the light theme is active
    When the safe areas and status bar are rendered
    Then the safe-area background uses the fixed plum presentation
    And the status-bar icons stay visible against it
    When the dark theme is active
    Then the same forest presentation is applied

  Scenario: Empty feed state
    Given no offers are available
    When the main page loads
    Then an empty-state message is displayed
