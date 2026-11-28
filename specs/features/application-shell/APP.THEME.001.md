# Spec: `APP.THEME.001`

## Metadata
- **Title**: System-Aware Material 3 Theme with Verified Appearances
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell (all screens)
- **Priority**: High

## Purpose
Make Material 3 color roles the app's only colors, with light and dark appearances treated as first-class for all three seed variants, no raw hex and device-verified route-aware system bars.

## Preconditions
- Application shell is available on Android.
- A Material 3 color scheme is active, with a static fallback where dynamic color is unavailable.

## Trigger
- App startup, user theme selection from menu/settings controls, a route change, or a theming audit.

## Requirements
- `APP.THEME.001-R1`: The system shall default to the device OS appearance preference.
- `APP.THEME.001-R2`: The system shall fully implement both light and dark appearances across all app views, each designed and tested as a first-class scheme rather than an inversion, as defined by `APP.ACCESSIBILITY.UX.002`.
- `APP.THEME.001-R3`: The user shall be able to override the system appearance in app settings.
- `APP.THEME.001-R4`: Manual override shall persist for the authenticated user account.
- `APP.THEME.001-R5`: The user shall be able to reset theme behavior back to the system default.
- `APP.THEME.001-R6`: The My Account view shall include a theme-change control.
- `APP.THEME.001-R7`: When the user changes theme from the My Account control, the selected appearance shall apply instantly in the current view without requiring app restart.
- `APP.THEME.001-R8`: All app surfaces, including the immersive presentation, navigation and the Offers views, shall use the active Material 3 scheme's color roles and the shared Material 3 component styles; no authored surface shall sit outside the scheme.
- `APP.THEME.001-R9`: Immersive overlay text and controls shall use the active scheme's on-surface roles so they remain legible in both appearances, without a fixed authored backdrop or a separate foreground token.
- `APP.THEME.001-R10`: Every visible chrome color — including navigation icons, immersive text, badges and action counters — shall come from the active Material 3 color roles; no raw hex value or fixed-backdrop token shall be used for chrome, as defined by `APP.PLATFORM.CHROME.001`.
- `APP.THEME.001-R11`: The status bar shall follow the active theme and presentation so its content stays legible in light, dark and immersive surfaces; the resulting style shall be verified on device per route, as defined by `APP.PLATFORM.CHROME.001`.
- `APP.THEME.001-R12`: The native startup surface shall provide a dark-appearance variant so a system-dark device does not flash a light surface before the app renders.
- `APP.THEME.001-R13`: Colors shall be expressed through Material 3 roles — primary, on-primary, primary-container, on-primary-container, secondary, tertiary, surface, on-surface, the surface-container levels, outline, error and their companion roles, plus inverse and scrim — so that role tokens resolve light and dark variants and contrast automatically; a raw hex literal shall not replace a role.
- `APP.THEME.001-R14`: Where dynamic color is available it may derive the scheme from the device wallpaper, with a static role-based scheme fallback that keeps the same roles and contrast guarantees; both paths shall be verified.
- `APP.THEME.001-R15`: Elevation shall be expressed through Material 3 tonal surface levels; arbitrary or single authored drop shadows shall not be used to fake elevation.
- `APP.THEME.001-R16`: A screen-by-screen light and dark appearance audit shall be evidenced by device captures covering every screen, including the immersive feed, sheets, dialogs, landscape and both foldable postures where a foldable is a target, as defined by `APP.ADAPTIVE.LANDSCAPE.001` and `APP.ADAPTIVE.UX.001`.
- `APP.THEME.001-R17`: Foreground text and essential control glyphs shall meet measured contrast thresholds in both appearances, with the evidence recorded as part of the audit, as defined by `APP.ACCESSIBILITY.UX.001`.
- `APP.THEME.001-R18`: Each of the three seed variants — Golden Hour/Lantern, Sunshine Market/Night Market and Tangerine & Mint/Cozy Dark — shall map, in both light and dark appearances, to the same complete Material 3 color role set, derived from that variant's seed: primary and its on/container roles, secondary and tertiary with their on/container roles, surface and on-surface with the surface-container levels and outline roles, error and its on/container roles, and the inverse and scrim roles.
- `APP.THEME.001-R19`: Every generated role set for all three seeds in both appearances — six sets in total — shall have text and essential control-glyph contrast verified against its surface roles, with the measurements recorded as part of the audit evidence of R16 and R17.
- `APP.THEME.001-R20`: Material 3 roles are the app colors and constitute the single accent language; no second accent, no authored night-footer surface, no fixed immersive backdrop and no other brand override shall replace a generated role. This is a replacement of the prior brand palette authority, not a refinement; behavior, copy and coordinate privacy remain unchanged, as defined by `APP.BRAND.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: App uses system appearance by default
  Given no manual theme override exists
  And the device is set to dark appearance
  When the user opens the app
  Then the app uses the dark Material 3 scheme

Scenario: Manual override supersedes system appearance
  Given device appearance is dark
  And the user selects light appearance in app settings
  When the user opens or resumes the app
  Then the app uses the light Material 3 scheme

Scenario: User resets to system default
  Given a manual theme override exists
  When the user selects use system appearance
  Then app appearance follows the current OS preference

Scenario: User changes appearance from My Account
  Given the app is using the light appearance
  When the user selects dark appearance from the My Account theme control
  Then the current view switches to dark appearance immediately

Scenario: Every surface uses the active Material 3 scheme
  Given the app is using dark appearance
  When the user views the immersive presentation, the navigation surface and the Offers views
  Then every surface uses the active role values and the shared Material 3 component styles
  And no authored surface sits outside the scheme

Scenario: Immersive overlay stays legible in both appearances
  Given the app uses the light appearance
  When the immersive presentation renders overlay text and controls
  Then they use the active on-surface roles and remain legible
  And the same roles are used in the dark appearance

Scenario: Chrome colors use Material 3 roles only
  Given the app uses any seed variant in light or dark appearance
  When navigation, immersive text and a status message are rendered
  Then their colors come from the active Material 3 roles
  And no raw hex literal or fixed-backdrop token is used for chrome

Scenario: Startup surface follows system appearance
  Given the device is set to dark appearance
  When the native startup surface is shown
  Then it uses a dark background variant
  And the light appearance keeps its own background

Scenario: Status bar follows the presentation
  Given the app is in a light, dark or immersive presentation
  When the surface is rendered
  Then the status bar content stays legible against that surface
  And the style is verified on device per route

Scenario: Both appearances are first-class on every screen
  Given every screen is rendered once in the light appearance and once in the dark appearance
  When the appearance audit is reviewed
  Then each screen is designed and tested for both appearances
  And neither appearance is a simple inversion of the other

Scenario: Material 3 roles resolve both appearances
  Given the app renders buttons, surfaces, outlines and error states
  When the light and dark appearances are compared
  Then colors come from Material 3 roles that resolve each appearance
  And no raw hex literal replaces a role

Scenario: Dynamic color falls back to a static scheme
  Given the device supports dynamic color and then does not
  When the theme is applied in each case
  Then the same Material 3 roles and contrast guarantees hold
  And both paths are verified

Scenario: Elevation uses tonal surface levels
  Given a raised surface is rendered
  When its elevation is shown
  Then it uses a standard Material 3 tonal surface level
  And no arbitrary or authored drop shadow is used

Scenario: Screen-by-screen audit evidence covers landscape and foldables
  Given a theming audit is performed
  When device captures are reviewed
  Then every screen appears in both appearances
  And landscape and both foldable postures are included where targeted

Scenario: Contrast is measured in both appearances
  Given foreground text and control glyphs are rendered in both appearances
  When they are measured against their role surfaces
  Then they meet the accessibility contrast thresholds in both appearances
  And the evidence is recorded with the audit

Scenario: Every seed maps to a complete M3 role set
  Given all three seed variants in both light and dark appearances
  When a primary action, a surface, a chip, an outline and an error state are rendered in each
  Then every color role used by those components resolves to a value derived from that variant's seed
  And no role used by a rendered component is left unresolved

Scenario: All six seed and appearance sets keep verified contrast
  Given the three seeds in light and dark appearances
  When text and essential control glyphs are measured on their role surfaces
  Then they meet the recorded contrast thresholds in each of the six sets
  And the measurements for all six sets are part of the audit evidence

Scenario: Material 3 roles govern every surface
  Given generated surface roles for any seed variant
  When the navigation surface and the immersive presentation are rendered
  Then they use the active Material 3 surface roles
  And no authored night-footer surface or fixed backdrop replaces them

Scenario: No second accent language is introduced
  Given a seed variant in either appearance
  When primary, secondary, tertiary and error roles are used across a view
  Then they carry only their Material 3 assigned meanings
  And no additional brand accent color is introduced

Scenario: Replacement preserves behavior and privacy
  Given the prior brand palette authority is retired
  When theme behavior is exercised across all views
  Then copy, behavior and coordinate privacy remain unchanged
```

## Example Inputs/Outputs
- Example input: OS appearance `dark`, app override `none`.
- Expected output: App renders the dark Material 3 scheme for the active seed.
- Example input: a screen captured in light and dark appearances.
- Expected output: both use purpose-designed M3 role sets with measured contrast, no raw hex, and matching layout.
- Example input: a dark immersive route followed by a light standard route.
- Expected output: both use the active scheme; route-aware status bar content updates on each change.
- Example input: three seeds × light and dark appearances in the audit.
- Expected output: six role sets with recorded contrast measurements.

## Edge Cases
- A brand surface rule would replace a generated surface role; the generated role wins.
- Theme preference is missing on first launch; the system default is used.
- Theme change at runtime updates the active view without full app restart.
- Dynamic color is available on one device and unavailable on another.
- An immersive overlay where one appearance's on-surface role would fail contrast; the role set is corrected, not replaced with a fixed color.
- Landscape or a foldable posture included in the audit where targeted.

## Non-Functional Constraints
- Theme switching should not cause perceptible layout jank.
- Raw hex literals shall not be used for chrome; color is expressed through Material 3 roles.
- Audit evidence shall be measured and cover both appearances on device for all six seed/appearance sets.

## Related Specs
- `APP.BRAND.001`
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `APP.HELP.CONTEXTUAL.001`
- `OFFERS.EMPTY.001`
- `APP.SHELL.001`
- `APP.THEME.002`
- `APP.THEME.003`
- `OFFERS.COMMENTS.001`
- `APP.SYMBOL.VOCABULARY.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `APP.ADAPTIVE.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.ADAPTIVE.LANDSCAPE.001`
