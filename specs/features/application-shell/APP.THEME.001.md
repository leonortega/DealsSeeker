# Spec: `APP.THEME.001`

## Metadata
- **Title**: System-Aware Theme with Manual Override
- **Version**: `v0.3`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: Medium

## Purpose
Provide light and dark theme support aligned with device preference and user override.

## Preconditions
- Application shell is available.

## Trigger
- App startup or user theme selection from menu/settings controls.

## Requirements
- `APP.THEME.001-R1`: The system shall default to the device OS theme preference.
- `APP.THEME.001-R2`: The system shall fully implement both light and dark themes across all app views.
- `APP.THEME.001-R3`: The user shall be able to override system theme in app settings.
- `APP.THEME.001-R4`: Manual override shall persist for the authenticated user account.
- `APP.THEME.001-R5`: The user shall be able to reset theme behavior back to system default.
- `APP.THEME.001-R6`: The My Account view shall include a theme-change control.
- `APP.THEME.001-R7`: When the user changes theme from the My Account control, the selected theme shall apply instantly in the current view without requiring app restart.
- `APP.THEME.001-R8`: All app surfaces, including the immersive offer chrome, the bottom footer navigation, and the offers views, shall use the active theme colors and the shared button styles.
- `APP.THEME.001-R9`: Text and metadata drawn on the fixed immersive backdrop shall use a foreground that remains legible in both themes, regardless of the active theme's text color.

## Acceptance Criteria (BDD)
```gherkin
Scenario: App uses system theme by default
  Given no manual theme override exists
  And the device is set to dark mode
  When the user opens the app
  Then the app shall use dark theme

Scenario: Manual override supersedes system theme
  Given device theme is dark
  And the user selects light theme in app settings
  When the user opens or resumes the app
  Then the app shall use light theme

Scenario: User resets to system default
  Given a manual theme override exists
  When the user selects use system theme
  Then app theme shall follow current OS preference

Scenario: User changes theme from My Account
  Given the app is using light theme
  When the user selects dark theme from the My Account theme control
  Then the current view shall switch to dark theme immediately

Scenario: Surfaces share the active theme colors
  Given the app is using dark theme
  When the user views the immersive offer chrome, the bottom footer navigation, and the offers views
  Then every surface shall use the active theme colors and the shared button styles

Scenario: Immersive metadata stays legible in the light theme
  Given the app is using the light theme
  When the immersive offer feed displays availability counts on the fixed backdrop
  Then the counts use a light foreground that remains legible
  And the same foreground is used when the dark theme is active
```

## Example Inputs/Outputs
- Example input: OS theme `dark`, app override `none`.
- Expected output: App renders dark theme.

## Edge Cases
- Theme preference is missing on first launch; system default is used.
- Theme change at runtime updates active view without full app restart.

## Non-Functional Constraints
- Theme switching should not cause perceptible layout jank.

## Related Specs
- `APP.SHELL.001`
- `APP.THEME.002`
- `OFFERS.COMMENTS.001`
- `APP.POLISH.UX.001`
- `APP.ADAPTIVE.UX.001`
