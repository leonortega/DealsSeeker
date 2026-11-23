# Spec: `APP.SHELL.002`

## Metadata
- **Title**: Native Navigation Behavior with Brand Chrome
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define that navigation structure and system interaction are delegated to native navigation behavior while the visible UI remains the DealsSeeker brand system on both platforms.

## Preconditions
- The application runs on iOS or Android as a mobile-only client.
- `DESIGN.md` is the authoritative visual system.

## Trigger
- The user navigates between sections, rotates the device, or changes the OS animation setting.

## Requirements
- `APP.SHELL.002-R1`: The system shall use platform-native navigation containers for stack state, transitions, tab state and system gesture handling.
- `APP.SHELL.002-R2`: Native navigation chrome shall be hidden; the branded application header and branded footer shall remain the only visible navigation surfaces.
- `APP.SHELL.002-R3`: The visible destinations, their order and their labels shall remain as defined in `APP.SHELL.001`; this spec shall not introduce a new visible destination.
- `APP.SHELL.002-R4`: The Create action shall remain a single floating action button and shall not become a tab destination.
- `APP.SHELL.002-R5`: Feed/Map presentation switching shall remain inside the Offers view as defined by `OFFERS.MODE.SWITCH.001`.
- `APP.SHELL.002-R6`: Switching between destinations shall preserve the destination's view state (including offers search query and radius) as required by `APP.SHELL.001-R19`.
- `APP.SHELL.002-R7`: The system shall apply safe-area and window insets so the branded header and footer clear system bars, cutouts and gesture areas on both platforms without altering their visual design.
- `APP.SHELL.002-R8`: When the OS Reduce Motion / Remove animations setting is enabled, transition behavior shall change while the brand UI shall remain unchanged.
- `APP.SHELL.002-R9`: The visible UI shall be identical on iOS and Android; no iOS Human Interface Guidelines or Material 3 visual adaptation shall be applied to the application's own components, typography, colors, iconography or layout.
- `APP.SHELL.002-R10`: The main sections shall be hosted by a native tab navigator that owns tab state and tab switching behavior; the branded night footer shall be supplied as a custom tab bar and shall remain the only visible tab surface.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Native navigation runs beneath the brand chrome
  Given the authenticated user is on a standard view
  When the user switches between footer destinations
  Then native navigation state and transitions shall handle the switch
  And the branded header and the night footer shall be the only visible navigation surfaces
  And no platform-native header or tab bar shall be visible

Scenario: Destination state survives a native tab switch
  Given the user has an active offers search query and radius
  When the user switches to another destination and back to Offers
  Then the search query and radius shall be restored

Scenario: System insets clear the brand chrome
  Given the app runs on a device with system bars, a cutout or gesture areas
  When a standard view is rendered
  Then the branded header and footer shall not be overlapped by system UI
  And their brand styling shall remain unchanged

Scenario: Reduce Motion changes transitions only
  Given the OS Reduce Motion or Remove animations setting is enabled
  When the user navigates between destinations
  Then navigation shall avoid large animated movement
  And the branded UI shall render identically to the default motion setting

Scenario: Native tab state with branded footer
  Given the authenticated user is on the main shell
  When the user switches between sections using the branded footer
  Then the native tab navigator shall own the selected destination state
  And the night footer shall be the only visible tab bar
  And selecting a footer destination shall restore that destination's view state
  And system Back shall follow the native tab back stack

Scenario: Brand UI is identical across platforms
  Given the same view state on iOS and Android
  When the branded shell is rendered on both platforms
  Then colors, typography, iconography, spacing and layout shall match
  And no platform-specific visual adaptation shall be applied
```

## Example Inputs/Outputs
- Example input: Switch from Offers to Suggestions and back with a query `coffee` and radius `1000 m`.
- Expected output: Native tab state is used; Offers returns with `coffee` and `1000 m`; brand chrome unchanged.
- Example input: OS Reduce Motion enabled.
- Expected output: Transition minimized; brand UI unchanged.

## Edge Cases
- A destination is opened while a transition is still in progress; navigation state shall remain deterministic.
- The device has no reported safe-area inset; the brand chrome shall still clear system UI using a minimum offset.
- A very long localized label shall wrap as defined in `APP.SHELL.001-R28`, with no platform-specific restyle.
- A tablet-width viewport shall keep the brand footer and the Add Offer two-column composition; no navigation rail or drawer shall be introduced.

## Non-Functional Constraints
- Native navigation dependencies shall be limited to navigation behavior; no visual component library shall be adopted.
- Dependency choices shall avoid unstable APIs.

## Related Specs
- `APP.SHELL.001`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `APP.ADAPTIVE.UX.001`
- `APP.ACCESSIBILITY.UX.001`
- `OFFERS.MODE.SWITCH.001`
- `ADD.OFFER.TABLET.LAYOUT.001`
