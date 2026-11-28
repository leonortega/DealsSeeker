Feature: Native navigation behavior with Material 3 chrome
  As a DealsSeeker user
  I want the app to follow my OS navigation behavior
  So that system Back, gestures, app bars and insets work with Material 3 defaults on every surface

  Scenario: Native navigation runs beneath Material 3 chrome
    Given the authenticated user is on a standard view at compact width
    When the user switches between destinations
    Then native navigation state and transitions shall handle the switch
    And the Material 3 navigation bar shall be the only navigation surface
    And it shall use the active scheme's tonal surface and standard active indicator
    And the standard view shall present a Material 3 app bar

  Scenario: Destination state survives a navigation switch
    Given the user has an active offers search query and radius
    When the user switches to another destination and back to Offers
    Then the search query and radius shall be restored

  Scenario: System insets clear the navigation surface
    Given the app runs on a device with system bars, a cutout or gesture areas
    When a standard view is rendered
    Then the navigation surface shall not be overlapped by system UI
    And the authenticated shell shall apply the platform-reported safe-area insets
    And the Material 3 treatment shall remain unchanged

  Scenario: Remove animations changes transitions only
    Given the OS Remove animations setting is enabled
    When the user navigates between destinations
    Then transitions resolve immediately or through a non-animated crossfade
    And normal navigation uses Material 3 motion physics with the standard preset
    And the visible UI shall remain unchanged

  Scenario: Native tab state with Material 3 navigation
    Given the authenticated user is on the main shell
    When the user switches between sections using the Material 3 navigation bar
    Then the native navigator shall own the selected destination state
    And the active destination shall use the Material 3 active indicator
    And no second custom tab bar shall be visible
    And selecting a destination shall restore that destination's view state
    And system Back shall follow the native tab back stack

  Scenario: Tablet width uses a Material 3 rail or drawer
    Given the app is rendered at an expanded tablet width
    When the main shell is displayed
    Then destinations shall be presented in a Material 3 navigation rail or drawer
    And that surface shall use the same active M3 roles, type roles and shape tokens as the compact bar
    And the compact bar shall not be shipped unchanged

  Scenario: Returning to compact width restores the Material 3 navigation bar
    Given the app was on a tablet-width navigation rail or drawer
    When the window narrows to a compact phone width
    Then destinations shall be presented in the Material 3 navigation bar
    And the Material 3 styling and destination state shall be preserved

  Scenario: Every standard view presents a Material 3 app bar
    Given the authenticated user is on a standard view
    When the view is rendered
    Then a Material 3 app bar shows the view title
    And no headerless exception or platform-native header substitution applies

  Scenario: Platform affordances keep Material 3 unchanged
    Given the same view state on iOS and Android
    When controls are rendered on both platforms
    Then each platform uses its native touch affordances and touch floors
    And labels, states, actions and Material 3 visuals remain identical

  Scenario: Material 3 UI is consistent across platforms and widths
    Given the same view state on iOS and Android at compact and expanded widths
    When the shell is rendered
    Then color roles, type roles, shape tokens and iconography shall match
    And only navigation structure may adapt to platform and width

  Scenario: Add Offer opens with native modal behavior
    Given the authenticated user is on a standard view
    When the user opens Add Offer
    Then platform-native modal behavior shall be used
    And the Add Offer content shall render with Material 3 components

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
    And Material 3 content shall remain visible

  Scenario: No close control is drawn by the shell inside content
    Given an overlay destination is open
    When the modal content is rendered
    Then no additional close button is drawn inside that content beyond the app bar affordance

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
    Then no in-app back button or arrow shall be displayed by the shell

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
    And Android shall use verified Material Symbols
    And matching controls shall keep identical accessible names on both platforms

  Scenario: Focused sub-tasks use sheets and destinations use native routes
    Given a focused sub-task and a full-screen destination are available
    When each is opened
    Then the sub-task shall use the single Material 3 sheet system
    And the destination shall use a native route
    And one Back dispatch and one focus-return rule shall apply to both

  Scenario: App bar exposes route title and actions on standard destinations
    Given the authenticated user is on a standard tab destination
    When the app bar is rendered
    Then it is a Material 3 app bar with the route title
    And it exposes the route's actions
    And no platform-native header exception applies

  Scenario: App bar actions keep their semantics at 200 percent font scale
    Given the Android font scale is set to 200 percent
    And a standard destination has a long localized title and an action
    When the Material 3 app bar is rendered
    Then the title reflows without clipping
    And the action keeps a 48 by 48 dp target and its name, role and state
