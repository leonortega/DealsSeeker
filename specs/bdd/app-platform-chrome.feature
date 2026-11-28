Feature: Full Material 3 platform shell chrome and conformance
  As a user of DealsSeeker on Android
  I want navigation, app bars, symbols, modality, touch sizing, predictive Back and system bars to follow Material 3 defaults
  So that the shell behaves natively without an authored brand overlay, with iOS compatibility retained but not gating this phase

  Scenario: Material navigation uses M3 surfaces on every width
    Given the authenticated shell is displayed on an Android phone at compact width
    When the navigation surface is rendered
    Then it is a Material 3 navigation bar with three to five destinations
    And it uses the active scheme's tonal surface and standard active indicator
    And no night-footer surface, waypoint tile or custom tab bar is rendered over it

  Scenario: Expanded width uses a Material 3 rail or drawer
    Given the authenticated shell is displayed at an expanded tablet width
    When the navigation surface is rendered
    Then a Material 3 navigation rail or drawer is used
    And the compact bar is not shipped unchanged
    And the same M3 roles and active indicator are retained

  Scenario: Every destination presents a Material 3 app bar
    Given standard top-level tabs, an overlay destination and the immersive presentation are available
    When each destination is rendered
    Then each shows a Material 3 app bar with a readable title
    And the standard tabs do not substitute a platform-native header
    And no destination is rendered without a Material 3 app bar

  Scenario: Overlay app bar adds a back affordance
    Given an overlay destination is opened
    When its screen is rendered
    Then the Material 3 app bar shows its title and back affordance
    And the destination's own content heading is unchanged

  Scenario: Immersive presentation stays headerless
    Given the immersive offers feed is displayed
    When the view is rendered
    Then the immersive top bar is the only top bar
    And no Material 3 app bar or platform-native header is rendered

  Scenario: One Material Symbols vocabulary across chrome
    Given shell controls are rendered on Android
    When the app bar, Create action, help, galleries and tabs display their symbols
    Then Android uses only verified Material Symbols
    And no second icon vocabulary, web icon set or authored glyph set is used
    And matching controls keep identical accessible names and actions

  Scenario: No mixed or web icon languages
    Given a screen with navigation, action and app bar controls
    When it is rendered
    Then no control uses a web icon set or a symbol from a second vocabulary
    And placeholder imagery is not treated as a control symbol
    And avatar artwork remains product content

  Scenario: One bottom-sheet system and one native-route system
    Given a focused sub-task and a full-screen destination are available
    When each is opened
    Then the sub-task uses a Material 3 bottom sheet and the destination uses a native route
    And no third modal or non-modal pattern is introduced
    And both keep the same M3 styling and dismissal conventions

  Scenario: Material dialogs and snackbars keep their roles
    Given transient status and a decision that must interrupt are both available
    When each is presented
    Then the transient status uses a Material 3 snackbar pattern
    And only the interrupting decision uses a Material 3 dialog
    And no non-actionable toast replaces the snackbar

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

  Scenario: Android touch floors are met
    Given tappable controls are rendered
    When they are measured
    Then every target is at least 48 by 48 dp
    And adjacent targets are separated by at least 8 dp

  Scenario: Touch floors hold at large text
    Given the system reading size is at its largest setting
    When controls with long localized labels are rendered
    Then the 48 by 48 dp floor and 8 dp separation still hold
    And labels reflow rather than shrinking the targets

  Scenario: Predictive Back stays alive
    Given the app runs on Android
    When the user starts the predictive Back gesture or presses Back
    Then the predictive Back affordance is available
    And the gesture resolves through native navigation
    And no application-level interceptor hijacks or replaces it

  Scenario: Back preview is not suppressed by exit confirmation
    Given an exit confirmation is armed on a destination
    When the user starts the predictive Back gesture
    Then the platform's progressive Back preview is still shown
    And the confirmation resolves after the gesture

  Scenario: Edge-to-edge insets keep content uncovered
    Given the status bar, navigation bar, a display cutout and the on-screen keyboard are present
    When a form or bottom control is rendered
    Then no control or label is hidden behind a system bar or the keyboard
    And content reflows when the keyboard appears and disappears

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

  Scenario: Single Create action stays available
    Given the authenticated shell is displayed
    When no sheet is open
    Then exactly one Create floating action button is visible outside the navigation surface
    And it is hidden while a sheet is open
    And no second floating action button is present

  Scenario: Text maps to the Material 3 type scale
    Given screens with headings, body copy and control labels
    When their text is rendered
    Then each maps to a Material 3 Display, Headline, Title, Body or Label role
    And no per-screen hand-picked font size or second typeface is used
    And text follows the system font-size setting

  Scenario: Motion uses Material 3 physics
    Given a transition or gallery motion would occur
    When it is rendered
    Then it uses spring-based Material 3 motion tokens with the standard preset by default
    And no hand-authored duration and easing curve governs it

  Scenario: Remove animations replaces motion
    Given the system Remove animations setting is enabled
    When a transition or gallery motion would occur
    Then the state change resolves immediately or through a non-animated crossfade
    And the same information and controls remain available

  Scenario: Elevation uses tonal surface levels
    Given a raised surface such as a sheet or card is rendered
    When its elevation is shown
    Then it uses a Material 3 tonal surface level from the surface pattern
    And no arbitrary or authored drop shadow is applied

  Scenario: Conformance is evidenced by device captures
    Given the app is built for Android
    When conformance is reviewed
    Then captures come from at least one phone and, when tablets are a target, one tablet
    And both appearances and an elevated font scale are captured
    And gesture, refresh-rate and smoothness claims come from a physical device where available

  Scenario: Shell chrome uses one Material 3 component library
    Given the authenticated shell is displayed on Android
    When the app bar, navigation bar, icon buttons, snackbar, dialog and sheet are rendered
    Then each is a pattern from one platform Material 3 component library
    And no hand-built imitation replaces any of them

  Scenario: Material 3 defaults win over former brand overrides
    Given a component default differs from a former brand color, footer surface, shape or shadow rule
    When that component appears in shell chrome
    Then the Material 3 default governs
    And no night-footer surface or waypoint tile is retained

  Scenario: Replacement preserves behavior and privacy
    Given the Material 3 component library is active
    When splash, immersive feed, palette world and status feedback are exercised
    Then behavior, copy and coordinate privacy remain unchanged
    And no library default changes navigation, modality or feedback outcomes
