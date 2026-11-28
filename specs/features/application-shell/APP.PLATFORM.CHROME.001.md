# Spec: `APP.PLATFORM.CHROME.001`

## Metadata
- **Title**: Full Material 3 Platform Shell Chrome and Conformance (Android gate)
- **Version**: `v5.0`
- **Status**: Approved
- **Context/View**: Application Shell (all destinations, all presentations)
- **Priority**: High

## Purpose
Make all shell chrome Material 3 by default on Android — app bars on every destination, M3 navigation bar/rail, Material Symbols, M3 sheets, dialogs and snackbars, predictive Back, edge-to-edge insets and a single FAB — with M3 roles, not brand overrides, as the authoritative styling.

## Preconditions
- The user is authenticated on the standard shell.
- The app runs on an Android phone or tablet at a compact or expanded width; iOS compatibility is retained but is not a verification gate in this phase.
- A Material 3 color scheme and type scale are active as defined by `APP.THEME.001` and `APP.TYPOGRAPHY.001`.

## Trigger
- A navigation surface, app bar, control, overlay, sheet, dialog, snackbar or route is rendered.

## Requirements
- `APP.PLATFORM.CHROME.001-R1`: The main navigation surface shall be a Material 3 navigation bar (three to five destinations) at compact width and a Material 3 navigation rail or drawer at expanded width, using the active scheme's tonal surface and the pattern's standard active indicator; no authored night-footer surface, active waypoint tile, custom or web-shaped tab bar shall be rendered over it.
- `APP.PLATFORM.CHROME.001-R2`: **Every standard destination shall present a Material 3 app bar pattern** - standard top-level tabs and overlay destinations included. Standard tabs shall not substitute a platform-native header for the Material 3 app bar; an overlay shall add a back affordance. The immersive presentation shall keep only its own top bar and shall remain headerless.
- `APP.PLATFORM.CHROME.001-R3`: Across all shell chrome — app bars, the Create action, help, galleries and tabs — Android shall use exactly one Material Symbols vocabulary, never a second icon language and never a web or authored icon set; iOS compatibility keeps one platform vocabulary; corresponding controls shall keep identical accessible names and actions, as defined by `APP.BRAND.001` and `APP.SYMBOL.VOCABULARY.001`.
- `APP.PLATFORM.CHROME.001-R4`: The shell shall use exactly two modality systems: a Material 3 bottom sheet for a focused sub-task and a native route for a full-screen destination. No screen shall introduce a third modal or non-modal pattern; system Back shall be dispatched by one policy that dismisses the topmost sheet before it navigates a route; dismissing a sheet shall return focus to the control that opened it, as defined by `APP.MODALITY.UNIFICATION.001`.
- `APP.PLATFORM.CHROME.001-R5`: Every tappable control shall meet a 48 by 48 dp touch floor on Android with at least 8 dp of separation between adjacent targets; a 44 by 44 pt floor is retained for iOS compatibility but is not a verification gate this phase, as defined by `APP.ACCESSIBILITY.UX.001` and `APP.ADAPTIVE.UX.002`.
- `APP.PLATFORM.CHROME.001-R6`: The predictive Back gesture and the Back button shall remain available on every Android screen; no application-level interceptor shall hijack or replace them, and an exit confirmation or overlay dismissal shall not suppress the platform's progressive Back preview.
- `APP.PLATFORM.CHROME.001-R7`: The status bar and its content style shall be derived from the active route rather than a single global flag: light standard destinations shall use dark content, dark or immersive destinations shall use light content, and the style shall update when the route changes; the result shall be verified on device, as defined by `APP.THEME.001`.
- `APP.PLATFORM.CHROME.001-R8`: The single Create action shall remain a single floating action button outside the navigation surface, reserved for that one primary action, and shall be hidden while a sheet is open; stacked floating action buttons or a secondary action promoted to one shall not be used.
- `APP.PLATFORM.CHROME.001-R9`: All chrome colors shall come from the active Material 3 color roles; no raw hex value shall be used for chrome and no authored accent, footer surface or tile shall be layered over the roles, as defined by `APP.THEME.001`.
- `APP.PLATFORM.CHROME.001-R10`: Standard views shall keep their own local content headings and the Offers control row; no redundant application-title bar shall be added beyond the Material 3 app bar.
- `APP.PLATFORM.CHROME.001-R11`: Content shall be laid out edge-to-edge with status bar, navigation bar, display cutout and IME insets applied, so that no control or label is hidden behind a system bar or the keyboard.
- `APP.PLATFORM.CHROME.001-R12`: Actions and feedback shall use Material 3 patterns — filled, tonal, outlined and text buttons, chips, switches, bottom sheets, dialogs and snackbars; ported iOS controls or invented equivalents shall not be used, and dialogs shall be reserved for decisions that must interrupt.
- `APP.PLATFORM.CHROME.001-R13`: Transient feedback shall be shown in a Material 3 snackbar pattern, actionable where useful and non-dismissive where an explicit Done/Undo status is required; a non-actionable toast shall not be used in its place.
- `APP.PLATFORM.CHROME.001-R14`: Text shall map to Material 3 type scale roles — Display, Headline, Title, Body and Label — across views, with no hand-picked per-screen font sizes or second typeface, and shall use scalable units so it follows the system font-size setting, as defined by `APP.TYPOGRAPHY.001`.
- `APP.PLATFORM.CHROME.001-R15`: Transitions shall use Material 3 motion physics (spring-based spatial and effect tokens) with the standard preset as the default; the system Remove animations setting shall be honored with an immediate final state or a non-animated crossfade, as defined by `APP.ADAPTIVE.UX.002`.
- `APP.PLATFORM.CHROME.001-R16`: Elevation shall be conveyed through Material 3 tonal surface levels via the platform's Material 3 surface pattern; arbitrary or single authored drop shadows shall not be used.
- `APP.PLATFORM.CHROME.001-R17`: Conformance shall be evidenced by device captures on at least one phone and, when tablets are a target, one tablet, in both appearances and at an elevated font scale; gestures, refresh rate and interaction smoothness evidence shall come from hardware where a physical device is available.
- `APP.PLATFORM.CHROME.001-R18`: Shell chrome components — app bars, the navigation bar and rail, icon buttons, snackbars, dialogs and sheets — shall come from one platform Material 3 component library; a hand-built imitation of those patterns shall not be substituted.
- `APP.PLATFORM.CHROME.001-R19`: Material 3 color roles, type roles, shape tokens and tonal elevation shall be applied to every such component through that library's defaults. Library defaults are authoritative; no brand role set or authored override shall replace them, as defined by `DESIGN.md`.
- `APP.PLATFORM.CHROME.001-R20`: This is a replacement of the prior brand-overlay chrome, not a refinement. Behavior, copy semantics, coordinate privacy, navigation, modality and feedback rules shall remain unchanged; the night-footer surface and waypoint tile shall not be reintroduced; the immersive headerless behavior is preserved as product behavior.

## Acceptance Criteria (BDD)
```gherkin
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

Scenario: Standard destinations present a Material 3 app bar
  Given standard top-level tabs and an overlay destination are available
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
```

## Example Inputs/Outputs
- Example input: Android shell with Offers active at compact width in dark appearance of a seed variant.
- Expected output: a Material 3 navigation bar with the standard active indicator, a Material 3 app bar titled Offers, and dark-appropriate status bar content; no night-footer surface or waypoint tile.
- Example input: the same shell rotated to an expanded tablet width.
- Expected output: a Material 3 navigation rail or drawer replaces the bar, with the same destinations, labels and active indicator.
- Example input: Add Offer opened as an overlay from an app bar.
- Expected output: Material Symbols throughout and a Material 3 app bar titled Add Offer with a back affordance.
- Example input: the user switches from a light Offers route to the immersive feed.
- Expected output: both routes show a Material 3 app bar; status bar content switches with the route.
- Example input: a help sheet is open above a native route and predictive Back is invoked.
- Expected output: the sheet is dismissed through its normal path and the route stays in place.
- Example input: the keyboard opens over a text field near the bottom of a sheet.
- Expected output: the field and its action remain visible above the keyboard and content reflows on dismissal.

## Edge Cases
- A platform-native header would be substituted on a standard tab; the Material 3 app bar pattern is used instead.
- A former brand role conflicts with a component default; the Material 3 default wins while interaction and dismissal behavior stay intact.
- Long localized destination and app bar labels at an elevated font scale reflow without reducing the 48 dp touch floor or 8 dp separation.
- A sheet is open while the Create floating action button would be visible; the action stays hidden and no second floating action button appears.
- A display cutout or gesture-navigation bar overlaps the app bar; content stays clear of it.
- Predictive Back is started while an exit confirmation is armed; the platform preview is not suppressed.
- Two sheets are stacked; one Back invocation dismisses only the topmost sheet.
- The chrome control that opened a sheet is no longer present when it is dismissed; focus moves to a sensible successor.
- A placeholder panel and an avatar image are rendered beside chrome controls; neither is treated as a control symbol.
- Remove animations is enabled mid-transition; the state resolves to its final state without a lingering partial animation.

## Non-Functional Constraints
- Accessible names, roles and actions stay identical across platforms.
- Only installed, verified Material Symbol resources are used; no new icon dependency is introduced for the symbol vocabulary.
- Both modality systems share one dismissal policy, one Back dispatch and one focus-return rule; no surface introduces a second policy.
- No raw hex value is used for chrome; color is expressed through Material 3 color roles.
- Edge-to-edge layout shall not trade away tappable area or legibility at any supported font scale.

## Related Specs
- `APP.SHELL.001`
- `APP.BRAND.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
- `APP.THEME.001`
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `APP.SHELL.003`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ADAPTIVE.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ADAPTIVE.LANDSCAPE.001`
- `APP.BOTTOM_SHEET.001`
- `APP.MODALITY.UNIFICATION.001`
- `APP.SYMBOL.VOCABULARY.001`
- `OFFERS.ACTIONS.LABELS.001`
