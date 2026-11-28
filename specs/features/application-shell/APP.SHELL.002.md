# Spec: `APP.SHELL.002`

## Metadata
- **Title**: Native Navigation Behavior with Material 3 Chrome
- **Version**: `v3.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Delegate navigation structure and system interaction to platform-native behavior while Material 3 defaults — not an authored brand footer — are the visible language on phone and tablet.

## Preconditions
- The application runs on Android as a mobile-only client, at a compact (phone) or expanded (tablet) width; iOS compatibility is retained but is not a verification gate in this phase.
- `DESIGN.md` is the authoritative visual system and makes Material 3 defaults authoritative.

## Trigger
- The user navigates between sections, rotates the device, changes the available width, or changes the OS animation setting.

## Requirements
- `APP.SHELL.002-R1`: The system shall use platform-native navigation containers for stack state, transitions, tab state and system gesture handling.
- `APP.SHELL.002-R2`: Standard views shall use a Material 3 navigation bar at compact width and a Material 3 navigation rail or drawer at expanded width, and shall present Material 3 app bars as defined by `APP.SHELL.005` and `APP.PLATFORM.CHROME.001`; no authored night-footer surface, waypoint tile, headerless exception or separate custom tab bar shall be rendered.
- `APP.SHELL.002-R3`: The visible destinations, their order and their labels shall remain as defined in `APP.SHELL.001`; this spec shall not introduce a new visible destination.
- `APP.SHELL.002-R4`: The Create action shall remain a single floating action button and shall not become a tab destination.
- `APP.SHELL.002-R5`: Feed/Map presentation switching shall remain inside the Offers view as defined by `OFFERS.MODE.SWITCH.001`.
- `APP.SHELL.002-R6`: Switching between destinations shall preserve the destination's view state (including offers search query and radius) as required by `APP.SHELL.001-R19`.
- `APP.SHELL.002-R7`: The system shall apply safe-area and window insets so every navigation surface clears system bars, cutouts and gesture areas without altering the Material 3 treatment.
- `APP.SHELL.002-R8`: When the OS Remove animations setting is enabled, transitions shall use Material 3 motion semantics by resolving to the final state immediately or through a non-animated crossfade; normal transitions shall use Material 3 motion physics, with the standard preset as the default.
- `APP.SHELL.002-R9`: Material 3 color roles, type roles, shape tokens and symbol vocabulary shall stay consistent across platforms and widths; copy, behavior and coordinate privacy shall remain unchanged, as defined by `APP.BRAND.001`.
- `APP.SHELL.002-R10`: The main sections shall be hosted by the platform's native navigation component, which shall own tab state and switching, surfaced as a Material 3 navigation bar at compact width and a Material 3 navigation rail or drawer at expanded width. The active destination shall be marked by the Material 3 pattern's standard active indicator, and no second custom tab surface shall be rendered.
- `APP.SHELL.002-R11`: Controls shall use the platform's native touch affordances and touch floors as defined by `APP.ACCESSIBILITY.UX.001`, with identical labels, states and actions on both platforms.
- `APP.SHELL.002-R12`: At expanded width, the Material 3 navigation rail or drawer shall carry the same active color scheme, type roles and shape tokens as the compact navigation bar; the compact bar shall not be shipped unchanged to a tablet-width viewport.
- `APP.SHELL.002-R13`: The platform's edge-swipe back gesture and predictive Back affordance shall remain available on every navigation surface and shall resolve through native navigation; an in-app exit confirmation or overlay dismissal shall not suppress the platform's Back preview.
- `APP.SHELL.002-R14`: Outside the offer action rail, each platform shall use one symbol vocabulary for shell chrome and content glyphs as defined by `APP.SYMBOL.VOCABULARY.001`; Android shall use verified Material Symbols, and matching controls shall keep identical accessible names and actions.
- `APP.SHELL.002-R15`: Focused sub-tasks shall use the single Material 3 sheet system and full-screen destinations shall use native routes, with one Back dispatch and one focus-return rule, as defined by `APP.MODALITY.UNIFICATION.001`.

## Acceptance Criteria (BDD)
```gherkin
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

Scenario: Compact width keeps the Material 3 navigation bar
  Given the app is rendered at a compact phone width
  When the main shell is displayed
  Then destinations shall be presented in the Material 3 navigation bar
  And its styling shall match the tablet navigation surface

Scenario: Every standard view presents a Material 3 app bar
  Given the authenticated user is on a standard view
  When the view is rendered
  Then a Material 3 app bar shows the view title
  And no headerless exception or platform-native header substitution applies

Scenario: Edge swipe back and predictive Back stay available
  Given the app runs on either platform
  When the user starts the platform's Back gesture on a destination
  Then the platform's edge-swipe or predictive Back affordance shall remain available
  And the gesture shall resolve through native navigation
  And an in-app confirmation shall not suppress the platform Back preview

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

Scenario: Chrome and content glyphs use one platform vocabulary
  Given shell chrome and content glyphs are rendered on iOS and Android
  When the controls are displayed
  Then each platform uses exactly one symbol vocabulary for those glyphs
  And Android uses verified Material Symbols
  And matching controls keep identical accessible names on both platforms

Scenario: Focused sub-tasks use sheets and destinations use native routes
  Given a focused sub-task and a full-screen destination are available
  When each is opened
  Then the sub-task uses the single Material 3 sheet system
  And the destination uses a native route
  And one Back dispatch and one focus-return rule apply to both
```

## Example Inputs/Outputs
- Example input: Switch from Offers to Suggestions and back with a query `coffee` and radius `1000 m`.
- Expected output: Native tab state is used; Offers returns with `coffee` and `1000 m`; the Material 3 navigation bar is unchanged.
- Example input: OS Remove animations enabled.
- Expected output: Transitions resolve immediately or with a non-animated crossfade; the visible UI is unchanged.
- Example input: Authenticated shell rendered on a device that reports a non-zero top inset.
- Expected output: The navigation surface and app bar clear the system area; Material 3 styling unchanged.
- Example input: The window widens from a phone to a tablet viewport.
- Expected output: Destinations move to a Material 3 navigation rail or drawer; the standard active indicator follows the selected destination.

## Edge Cases
- A destination is opened while a transition is still in progress; navigation state shall remain deterministic.
- The device has no reported safe-area inset; the navigation surface shall still clear system UI using a minimum offset.
- A very long localized label shall wrap as defined in `APP.SHELL.001-R28`, without changing the navigation surface.
- A tablet-width viewport uses a rail or drawer; rotating back to compact restores the Material 3 navigation bar with the same styling and preserved view state.
- Predictive Back is triggered while an exit confirmation is armed; the platform preview shall still appear before confirmation resolves.
- A focused sub-task is opened over a native route; one Back invocation dismisses the sheet without popping the route.
- A placeholder panel or avatar is rendered in a native surface; neither is counted as a second symbol vocabulary.
- A former brand footer rule would restyle the navigation surface; the Material 3 surface pattern wins.

## Non-Functional Constraints
- Native navigation dependencies shall be limited to navigation behavior; visual defaults shall come from the Material 3 component system.
- Dependency choices shall avoid unstable APIs.

## Related Specs
- `APP.BRAND.001`
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.005`
- `APP.THEME.001`
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `APP.ADAPTIVE.LANDSCAPE.001`
- `APP.SHELL.001`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ADAPTIVE.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.BOTTOM_SHEET.001`
- `APP.LIFECYCLE.001`
- `APP.ACCESSIBILITY.UX.004`
- `OFFERS.MODE.SWITCH.001`
- `ADD.OFFER.TABLET.LAYOUT.001`
- `APP.SYMBOL.VOCABULARY.001`
- `APP.MODALITY.UNIFICATION.001`
