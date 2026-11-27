# Spec: `APP.PLATFORM.CHROME.001`

## Metadata
- **Title**: Platform-Native Shell Chrome and Conformance
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell (authenticated views)
- **Priority**: Medium

## Purpose
Keep shell chrome platform-native — navigation surfaces, headers, symbols, modality, touch sizing, Back and status bar — while the brand supplies the palette, type roles, night-footer surface and active waypoint tile.

## Preconditions
- The user is authenticated on the standard shell.
- The app runs on iOS or Android at a compact or expanded width.

## Trigger
- A navigation surface, header, control, overlay or route is rendered.

## Requirements
- `APP.PLATFORM.CHROME.001-R1`: The main navigation surface shall be the platform-native tab bar at compact width and a navigation rail or drawer at expanded width, styled with the brand's night-footer surface and active waypoint tile as defined by `APP.SHELL.002`; no separate custom tab bar shall be rendered over it.
- `APP.PLATFORM.CHROME.001-R2`: Every standard top-level destination shall present a platform-native header with a readable title and the platform's standard leading affordance where one applies; an overlay destination shall use the same native header with a back affordance; the immersive presentation shall remain headerless as defined by `APP.SHELL.005`.
- `APP.PLATFORM.CHROME.001-R3`: Across all shell chrome, each platform shall use one symbol vocabulary — SF-style symbols on iOS and Material symbols on Android — never a second web icon set and never a mix of the two; corresponding controls shall keep identical accessible names and actions on both platforms.
- `APP.PLATFORM.CHROME.001-R4`: The shell shall use one consistent modality system: a dismissible sheet for a focused sub-task and a full-screen cover for the immersive presentation, each with consistent confirmation, Cancel/Done placement and dismissal behavior; no screen shall introduce a second, conflicting modal or non-modal pattern.
- `APP.PLATFORM.CHROME.001-R5`: Every tappable control shall meet the platform touch floor — at least 44×44 pt on iOS and 48×48 dp on Android — with the platform's required separation between adjacent targets, as defined by `APP.ACCESSIBILITY.UX.001` and `APP.ADAPTIVE.UX.002`.
- `APP.PLATFORM.CHROME.001-R6`: The platform's edge-swipe back gesture on iOS and predictive Back on Android shall remain available on every screen; no application-level interceptor shall hijack or replace them, and an exit confirmation or overlay dismissal shall not suppress the platform's progressive Back preview.
- `APP.PLATFORM.CHROME.001-R7`: The status bar and its content style shall be derived from the active route rather than a single global flag: light standard destinations shall use dark content, dark or immersive destinations shall use light content, and the style shall update when the route changes.
- `APP.PLATFORM.CHROME.001-R8`: The single Create action shall remain a floating action outside the navigation surface and shall be hidden while a sheet is open.
- `APP.PLATFORM.CHROME.001-R9`: Brand colors, type roles, night-footer surface and waypoint tile shall be retained on every chrome surface; only the chrome components and symbol glyphs shall follow the platform.
- `APP.PLATFORM.CHROME.001-R10`: Standard views shall keep their own local content headings and the Offers control row; no redundant application-title bar shall be added beyond the platform-native header.

## Acceptance Criteria (BDD)
```gherkin
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

Scenario: One symbol vocabulary per platform
  Given shell controls are rendered on iOS and Android
  When their icons are displayed
  Then iOS uses only SF-style symbols and Android only Material symbols
  And matching controls keep identical accessible names and actions

Scenario: No mixed or web icon languages
  Given a screen with navigation, action and header controls
  When it is rendered on either platform
  Then no control uses a symbol from the other platform's set or a web icon set

Scenario: One consistent modality system
  Given a focused sub-task and an immersive presentation are available
  When each is opened
  Then the sub-task uses a dismissible sheet and the immersive presentation uses a full-screen cover
  And both use the same Cancel/Done and dismissal conventions
  And no screen introduces a second conflicting modality pattern

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
```

## Example Inputs/Outputs
- Example input: iOS shell with Offers active at compact width.
- Expected output: native iOS tab bar carrying the night-footer surface and a tangerine active waypoint tile, with a native header titled Offers.
- Example input: Android shell with Add Offer opened as an overlay.
- Expected output: Material symbols in the navigation surface and a native Android header titled Add Offer with a back affordance.
- Example input: The user switches from a light Offers route to the immersive feed.
- Expected output: status bar content switches from dark to light with the route.

## Edge Cases
- Long localized tab and header labels at large text sizes reflow without reducing the touch floor.
- A sheet is open while the Create action would be visible; the action stays hidden.
- A platform without a native stack header still shows a readable title and back affordance on overlay destinations.
- Predictive Back is started while an exit confirmation is armed; the platform preview is not suppressed.

## Non-Functional Constraints
- Accessible names, roles and actions stay identical on both platforms.
- Only installed symbol resources are used; no new icon dependency is introduced for the symbol vocabulary.

## Related Specs
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.SHELL.005`
- `APP.BRAND.001`
- `APP.TYPOGRAPHY.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ADAPTIVE.UX.002`
