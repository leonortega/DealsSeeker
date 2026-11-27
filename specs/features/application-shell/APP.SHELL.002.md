# Spec: `APP.SHELL.002`

## Metadata
- **Title**: Native Navigation Behavior with Brand Chrome
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define that navigation structure and system interaction are delegated to platform-native behavior while the brand's night-footer surface, active waypoint tile, palette and type remain the visible language on phone and tablet.

## Preconditions
- The application runs on iOS or Android as a mobile-only client, at a compact (phone) or expanded (tablet) width.
- `DESIGN.md` is the authoritative visual system.

## Trigger
- The user navigates between sections, rotates the device, changes the available width, or changes the OS animation setting.

## Requirements
- `APP.SHELL.002-R1`: The system shall use platform-native navigation containers for stack state, transitions, tab state and system gesture handling.
- `APP.SHELL.002-R2`: Standard views shall use the platform-native tab bar styled with the brand's night-footer surface and an active waypoint tile as defined by `DESIGN.md` and `APP.PLATFORM.CHROME.001`; no separate custom tab bar shall be rendered over it, and a single platform-native header may be present as defined by `APP.SHELL.005`.
- `APP.SHELL.002-R3`: The visible destinations, their order and their labels shall remain as defined in `APP.SHELL.001`; this spec shall not introduce a new visible destination.
- `APP.SHELL.002-R4`: The Create action shall remain a single floating action button and shall not become a tab destination.
- `APP.SHELL.002-R5`: Feed/Map presentation switching shall remain inside the Offers view as defined by `OFFERS.MODE.SWITCH.001`.
- `APP.SHELL.002-R6`: Switching between destinations shall preserve the destination's view state (including offers search query and radius) as required by `APP.SHELL.001-R19`.
- `APP.SHELL.002-R7`: The system shall apply safe-area and window insets so every navigation surface clears system bars, cutouts and gesture areas on both platforms without altering its brand styling.
- `APP.SHELL.002-R8`: When the OS Reduce Motion / Remove animations setting is enabled, transition behavior shall change while the brand UI shall remain unchanged.
- `APP.SHELL.002-R9`: Brand identity, information architecture, copy and visual language (palette, type roles, shapes, brand icon set) shall stay identical on iOS and Android at every width; platform-native structure and width-adaptive navigation shall be used where the platform provides them, without restyling the brand surface.
- `APP.SHELL.002-R10`: The main sections shall be hosted by the platform's native navigation component, which shall own tab state and switching: a bottom tab bar at compact width and a navigation rail or drawer at expanded/tablet width. The active destination shall be marked with the brand waypoint tile, and no second custom tab surface shall be rendered.
- `APP.SHELL.002-R11`: Controls shall use the platform's native touch affordances and touch floors as defined by `APP.ACCESSIBILITY.UX.001`, with identical labels, states and actions on both platforms.
- `APP.SHELL.002-R12`: At expanded/tablet width, the navigation rail or drawer shall carry the same night-footer surface, waypoint tile, palette and type roles as the compact tab bar; the compact bottom bar shall not be shipped unchanged to a tablet-width viewport.
- `APP.SHELL.002-R13`: The platform's edge-swipe back gesture and predictive Back affordance shall remain available on every navigation surface and shall resolve through native navigation; an in-app exit confirmation or overlay dismissal shall not suppress the platform's Back preview.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Native navigation runs beneath the brand-styled tab bar
  Given the authenticated user is on a standard view at compact width
  When the user switches between destinations
  Then native navigation state and transitions shall handle the switch
  And the platform-native tab bar shall be the only navigation surface
  And it shall carry the night-footer surface with an active waypoint tile
  And a single platform-native header may be present as defined by APP.SHELL.005

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

Scenario: Compact width keeps the native bottom tab bar
  Given the app is rendered at a compact phone width
  When the main shell is displayed
  Then destinations shall be presented in the platform-native bottom tab bar
  And the brand styling shall match the tablet navigation surface

Scenario: Edge swipe back and predictive Back stay available
  Given the app runs on either platform
  When the user starts the platform's Back gesture on a destination
  Then the platform's edge-swipe or predictive Back affordance shall remain available
  And the gesture shall resolve through native navigation
  And an in-app confirmation shall not suppress the platform Back preview

Scenario: Platform affordances keep the brand unchanged
  Given the same view state on iOS and Android
  When controls are rendered on both platforms
  Then each platform uses its native touch affordances and touch floors
  And labels, states, actions and brand visuals remain identical

Scenario: Brand UI is consistent across platforms and widths
  Given the same view state on iOS and Android at compact and expanded widths
  When the branded shell is rendered
  Then palette, type roles, iconography, spacing and waypoint tile shall match
  And only navigation structure may adapt to platform and width
```

## Example Inputs/Outputs
- Example input: Switch from Offers to Suggestions and back with a query `coffee` and radius `1000 m`.
- Expected output: Native tab state is used; Offers returns with `coffee` and `1000 m`; the brand-styled tab bar is unchanged.
- Example input: OS Reduce Motion enabled.
- Expected output: Native stack and modal transitions use a minimized animation; brand UI unchanged.
- Example input: Authenticated shell rendered on a device that reports a non-zero top inset.
- Expected output: The navigation surface clears the bottom system area; brand styling unchanged.
- Example input: The window widens from a phone to a tablet viewport.
- Expected output: Destinations move to a brand-styled navigation rail or drawer; the active waypoint tile follows the selected destination.

## Edge Cases
- A destination is opened while a transition is still in progress; navigation state shall remain deterministic.
- The device has no reported safe-area inset; the navigation surface shall still clear system UI using a minimum offset.
- A very long localized label shall wrap as defined in `APP.SHELL.001-R28`, without changing the navigation surface.
- A tablet-width viewport uses a rail or drawer; rotating back to compact width restores the bottom tab bar with the same brand styling and preserved view state.
- Predictive Back is triggered while an exit confirmation is armed; the platform preview shall still appear before confirmation resolves.

## Non-Functional Constraints
- Native navigation dependencies shall be limited to navigation behavior; no visual component library shall be adopted.
- Dependency choices shall avoid unstable APIs.

## Related Specs
- `APP.SHELL.001`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.005`
- `APP.TYPOGRAPHY.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ADAPTIVE.UX.001`
- `APP.BOTTOM_SHEET.001`
- `APP.LIFECYCLE.001`
- `APP.ACCESSIBILITY.UX.004`
- `OFFERS.MODE.SWITCH.001`
- `ADD.OFFER.TABLET.LAYOUT.001`
