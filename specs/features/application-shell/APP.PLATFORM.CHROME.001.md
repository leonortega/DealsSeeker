# Spec: `APP.PLATFORM.CHROME.001`

## Metadata
- **Title**: Platform-Native Navigation Chrome
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell (authenticated views)
- **Priority**: Medium

## Purpose
Use the platform's native tab bar, stack headers and symbol vocabulary for shell navigation while keeping the brand's palette, type roles and information architecture.

## Preconditions
- The user is authenticated on the standard shell.
- The app runs on iOS or Android.

## Trigger
- A tab destination, overlay destination or navigation control is rendered.

## Requirements
- `APP.PLATFORM.CHROME.001-R1`: The main tab bar shall be the platform's native tab bar component on both platforms, tinted with the active palette; the custom branded footer shall not be rendered over it.
- `APP.PLATFORM.CHROME.001-R2`: Navigation chrome shall use the platform symbol set: SF-style symbols on iOS and Material symbols on Android, with identical accessible names and actions.
- `APP.PLATFORM.CHROME.001-R3`: Overlay destinations presented by the native stack shall use the platform's native header with a readable title and standard back affordance.
- `APP.PLATFORM.CHROME.001-R4`: Standard views shall keep their local content headings and Offers control row; a second global title bar shall not be added.
- `APP.PLATFORM.CHROME.001-R5`: The single Create action shall remain available as a floating action outside the tab bar and shall be hidden while a sheet is open.
- `APP.PLATFORM.CHROME.001-R6`: Brand colors and touch floors shall remain unchanged; only the chrome component and icon glyphs follow the platform.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Native tab bar with platform symbols
  Given the authenticated shell is displayed on iOS and Android
  When the tab bar is rendered
  Then each platform uses its native tab bar component
  And navigation icons come from that platform's symbol set
  And the active tint follows the active palette

Scenario: Overlay destinations use native headers
  Given an overlay destination is opened
  When its screen is rendered
  Then the platform-native header shows its title and back affordance
  And the destination's own content heading is unchanged

Scenario: Local Offers controls stay reachable
  Given the standard Offers view is displayed
  When its controls are rendered
  Then the presentation switch and help control remain visible
  And no second global title bar is added

Scenario: Create action stays available
  Given the authenticated shell is displayed
  When no sheet is open
  Then a single Create action is visible outside the tab bar
  And it is hidden while a sheet is open
```

## Example Inputs/Outputs
- Example input: iOS shell with Offers active.
- Expected output: native iOS tab bar with SF-style symbols and tangerine active tint.
- Example input: Android shell with Add Offer opened.
- Expected output: Material symbols in the navigation bar and a native Android header titled Add Offer.

## Edge Cases
- Long localized tab labels at large text sizes.
- A sheet open while the Create action would be visible.
- A platform without a native stack header.

## Non-Functional Constraints
- Use the already-installed icon dependency; no new native module.
- Accessible names, roles and actions stay identical on both platforms.

## Related Specs
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.SHELL.005`
- `APP.BRAND.001`
