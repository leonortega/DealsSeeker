Feature: Platform-native shell chrome and conformance
  As a user of DealsSeeker on iOS or Android
  I want navigation, headers, symbols, modality, touch sizing, Back and the status bar to follow my platform
  So that the shell behaves natively while keeping the brand

  Scenario: Native navigation surface carries the brand night-footer surface
    Given the authenticated shell is displayed on iOS and Android at compact width
    When the navigation surface is rendered
    Then each platform uses its native tab bar component
    And it carries the night-footer surface with an active waypoint tile
    And no separate custom tab bar is rendered over it

  Scenario: Native headers appear on top-level tabs
    Given the authenticated shell is displayed on a standard top-level destination
    When the destination is rendered
    Then a platform-native header shows its title
    And the platform's standard leading affordance is present where applicable
    And brand palette and type roles are retained

  Scenario: Overlay destinations use native headers with back affordance
    Given an overlay destination is opened
    When its screen is rendered
    Then the platform-native header shows its title and back affordance
    And the destination's own content heading is unchanged

  Scenario: Immersive presentation stays headerless
    Given the immersive offers feed is displayed
    When the view is rendered
    Then no platform-native header is displayed
    And only the immersive top bar is present

  Scenario: One symbol vocabulary per platform across chrome
    Given shell controls are rendered on iOS and Android
    When the headers, Create action, help, galleries and tabs display their symbols
    Then iOS uses only SF-style symbols and Android only Material symbols
    And matching controls keep identical accessible names and actions

  Scenario: No mixed or web icon languages
    Given a screen with navigation, action and header controls
    When it is rendered on either platform
    Then no control uses a symbol from the other platform's vocabulary or a web icon set
    And placeholder imagery is not treated as a control symbol
    And avatar artwork remains product content

  Scenario: One sheet system and one native-route system
    Given a focused sub-task and a full-screen destination are available
    When each is opened
    Then the sub-task uses a native sheet and the destination uses a native route
    And no third modal or non-modal pattern is introduced
    And both keep the same brand styling and dismissal conventions

  Scenario: One Back dispatch for sheets and routes
    Given a sheet is open above a native route
    When system Back is invoked
    Then the topmost sheet is dismissed through its normal dismissal path
    And the native route is not popped by the same invocation

  Scenario: Focus returns after a sheet is dismissed
    Given a sheet was opened from a chrome control
    When the sheet is dismissed
    Then focus returns to the control that opened it

  Scenario: Modality dismissal stays consistent with unsaved edits
    Given a sheet has unsaved edits
    When a dismissal gesture or Back is invoked
    Then the same guarded-dismissal confirmation is shown as on any other sheet
    And no data is discarded before confirmation

  Scenario: Platform touch floors are met
    Given tappable controls are rendered on both platforms
    When they are measured
    Then iOS targets are at least 44 by 44 pt
    And Android targets are at least 48 by 48 dp
    And adjacent targets keep the platform's required separation

  Scenario: Touch floors hold at large text
    Given the system reading size is at its largest setting
    When controls with long localized labels are rendered
    Then the platform touch floors still hold
    And labels reflow rather than shrinking the targets

  Scenario: Edge swipe back and predictive Back stay alive
    Given the app runs on iOS or Android
    When the user starts the platform's Back gesture
    Then the edge-swipe or predictive Back affordance is available
    And the gesture resolves through native navigation
    And no application-level interceptor hijacks or replaces it

  Scenario: Back preview is not suppressed by exit confirmation
    Given an exit confirmation is armed on a destination
    When the user starts a Back gesture
    Then the platform's progressive Back preview is still shown
    And the confirmation resolves after the gesture

  Scenario: Status bar follows the route
    Given a light standard destination and a dark immersive destination
    When each route is rendered
    Then the status bar content style matches that route
    And the style is not driven by a single global flag

  Scenario: Status bar updates when the route changes
    Given the app is on a light standard destination
    When the user navigates to the immersive destination and back
    Then the status bar content style changes with each route
    And no stale global style remains

  Scenario: Local Offers controls stay reachable
    Given the standard Offers view is displayed
    When its controls are rendered
    Then the presentation switch and help control remain visible
    And no redundant second title bar is added

  Scenario: Create action stays available
    Given the authenticated shell is displayed
    When no sheet is open
    Then a single Create action is visible outside the navigation surface
    And it is hidden while a sheet is open
