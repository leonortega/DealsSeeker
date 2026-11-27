Feature: Native navigation behavior with brand chrome
  As a DealsSeeker user
  I want the app to follow my OS navigation behavior
  So that system Back, gestures, headers and insets work while the app still looks like DealsSeeker

  Scenario: Native navigation runs beneath the brand-styled tab bar
    Given the authenticated user is on a standard view at compact width
    When the user switches between destinations
    Then native navigation state and transitions shall handle the switch
    And the platform-native tab bar shall be the only navigation surface
    And it shall carry the night-footer surface with an active waypoint tile
    And a single platform-native header may be present in the standard view

  Scenario: Destination state survives a native tab switch
    Given the user has an active offers search query and radius
    When the user switches to another destination and back to Offers
    Then the search query and radius shall be restored

  Scenario: System insets clear the navigation surface
    Given the app runs on a device with system bars, a cutout or gesture areas
    When a standard view is rendered
    Then the navigation surface shall not be overlapped by system UI
    And the authenticated shell shall apply the platform-reported safe-area insets
    And its brand styling shall remain unchanged

  Scenario: Reduce Motion changes transitions only
    Given the OS Reduce Motion or Remove animations setting is enabled
    When the user navigates between destinations
    Then native stack and modal transition animations shall be minimized
    And navigation shall avoid large animated movement
    And the branded UI shall render identically to the default motion setting

  Scenario: Native tab state with a brand-styled tab bar
    Given the authenticated user is on the main shell
    When the user switches between sections using the platform-native tab bar
    Then the native tab navigator shall own the selected destination state
    And the active destination shall be marked with the brand waypoint tile
    And no second custom tab bar shall be visible
    And selecting a destination shall restore that destination's view state
    And system Back shall follow the native tab back stack

  Scenario: Tablet width uses a navigation rail or drawer
    Given the app is rendered at an expanded tablet width
    When the main shell is displayed
    Then destinations shall be presented in a navigation rail or drawer
    And that surface shall carry the night-footer surface, waypoint tile, palette and type
    And the compact bottom bar shall not be shipped unchanged

  Scenario: Returning to compact width restores the bottom tab bar
    Given the app was on a tablet-width navigation rail or drawer
    When the window narrows to a compact phone width
    Then destinations shall be presented in the platform-native bottom tab bar
    And the brand styling and destination state shall be preserved

  Scenario: Native header is present on standard views and absent in the immersive feed
    Given the authenticated user is on a standard view and then opens the immersive offers feed
    When each presentation is rendered
    Then the standard view shows a platform-native header with its title
    And the immersive feed shows no platform-native header
    And only the immersive top bar is present in that presentation

  Scenario: Platform affordances keep the brand unchanged
    Given the same view state on iOS and Android
    When controls are rendered on both platforms
    Then each platform uses its native touch affordances and touch floors
    And labels, states, actions and brand visuals remain identical

  Scenario: Brand UI is consistent across platforms and widths
    Given the same view state on iOS and Android at compact and expanded widths
    When the branded shell is rendered on both platforms
    Then palette, type roles, iconography, spacing and waypoint tile shall match
    And only navigation structure may adapt to platform and width

  Scenario: Add Offer opens with native modal behavior
    Given the authenticated user is on a standard view
    When the user opens Add Offer
    Then platform-native modal behavior shall be used
    And the Add Offer content shall render with unchanged brand styling

  Scenario: Platform dismissal with no unsaved edits
    Given the Add Offer draft has no unsaved edits
    When the user invokes a platform dismissal gesture
    Then the modal shall close and the previous view shall be shown
    And the previous view state shall be preserved

  Scenario: Platform dismissal with unsaved edits
    Given the Add Offer draft has unsaved edits
    When the user invokes a platform dismissal gesture or system back
    Then the discard confirmation shall be shown
    And no draft data shall be discarded before confirmation

  Scenario: Favorites uses native stack behavior
    Given the authenticated user opens Favorites
    When the user closes Favorites with system back
    Then native pop behavior shall return to the previous view
    And brand-styled content shall remain visible

  Scenario: No foreign close control appears in the brand UI
    Given an overlay destination is open
    When the modal content is rendered
    Then no platform-native close button shall be drawn inside the brand-styled content

  Scenario: Back from Offers asks for exit confirmation
    Given the user is on Offers with no open overlay
    When the user invokes system Back
    Then an exit confirmation is shown
    And the application remains open until the user confirms

  Scenario: Back closes an open overlay before the exit confirmation
    Given an overlay is open on Offers
    When the user invokes system Back
    Then the overlay closes
    And no exit confirmation is shown

  Scenario: Back returns to Offers from another view
    Given the user moved from Offers to Suggestions
    When the user invokes system Back
    Then Offers becomes visible with its search query and radius preserved
    And the application remains open

  Scenario: Back from the immersive feed destination
    Given the user opened My Account from the immersive offers feed
    When the user invokes system Back
    Then the immersive offers feed shall become visible again

  Scenario: Back from Add Offer with unsaved edits
    Given the Add Offer draft has unsaved edits
    When the user invokes system Back
    Then the discard confirmation shall be shown
    And the draft shall remain until the user confirms

  Scenario: Back adds no visible control
    Given the user is on any destination
    When system Back handling is active
    Then no in-app back button or arrow shall be displayed

  Scenario: Back during an in-progress save
    Given an Add Offer save request is in progress
    When the user invokes system Back
    Then the request shall resolve before the shell reacts
    And the Back action shall not be applied twice

  Scenario: Predictive Back is available on Android
    Given the app runs on Android
    When the user starts a system Back gesture
    Then the platform's predictive Back affordance is available
    And the gesture resolves through the same shell Back policy as the Back button
    And no application-level interceptor suppresses the platform Back preview

  Scenario: iOS edge-swipe back gesture stays alive
    Given the app runs on iOS
    When the user swipes back from the left edge of a pushed destination
    Then the platform edge-swipe back gesture remains available
    And the destination pops through native navigation
    And no overlay control blocks the gesture

  Scenario: Predictive Back preview survives an armed exit confirmation
    Given an exit confirmation is armed on a destination
    When the user starts a predictive Back gesture
    Then the platform's progressive preview is still shown
    And the confirmation resolves after the gesture completes

  Scenario: Chrome and content glyphs use one platform vocabulary
    Given shell chrome and content glyphs are rendered on iOS and Android
    When the controls are displayed
    Then each platform shall use exactly one symbol vocabulary for those glyphs
    And matching controls shall keep identical accessible names on both platforms

  Scenario: Focused sub-tasks use sheets and destinations use native routes
    Given a focused sub-task and a full-screen destination are available
    When each is opened
    Then the sub-task shall use the single sheet system
    And the destination shall use a native route
    And one Back dispatch and one focus-return rule shall apply to both
