# Spec: `APP.THEME.006`

## Metadata
- **Title**: Theme World Selection
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: My Account, all views
- **Priority**: Medium

## Purpose
Let the user choose between the three palette worlds created during design, each with its own light and dark variant.

## Preconditions
- The user is authenticated and on My Account.

## Trigger
- The user selects a theme world or an appearance mode.

## Requirements
- `APP.THEME.006-R1`: My Account shall offer three theme worlds: Golden Hour/Lantern, Sunshine Market/Night Market, and Tangerine & Mint/Cozy Dark.
- `APP.THEME.006-R2`: The selected world shall supply both the light and dark palette; the appearance mode shall keep choosing system, light or dark within that world.
- `APP.THEME.006-R3`: A world change shall apply immediately to every surface, including the footer and immersive backdrop, without a restart.
- `APP.THEME.006-R4`: The world choice shall persist across launches alongside the appearance mode.
- `APP.THEME.006-R5`: Each world selector option shall expose its selected state to assistive technology.
- `APP.THEME.006-R6`: All three worlds shall keep the contrast floors and status-label rules of `APP.THEME.005`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Selecting a theme world
  Given the user is on My Account
  When the user selects the Sunshine Market world
  Then its light or dark palette applies according to the appearance mode
  And the option is marked as selected
  And the choice persists after relaunch

Scenario: Appearance mode works within a world
  Given the Tangerine & Mint world is selected
  When the user selects Dark appearance
  Then the Cozy Dark palette applies
  And the System option still follows the device appearance

Scenario: World change recolors the shell
  Given any world is selected
  When the user chooses another world
  Then the footer and immersive backdrop update with the same palette family
  And no surface keeps colors from the previous world
```

## Example Inputs/Outputs
- Example input: select Golden Hour with Light appearance.
- Expected output: warm paper `#fbf6ec`, terracotta `#b0512c`, sage panels.

## Edge Cases
- Switching worlds while an overlay is open.
- Appearance set to System with either OS scheme.
- Stored world missing or invalid on upgrade.
- Large text on three selector options.

## Non-Functional Constraints
- No new dependency shall be added; palettes are local token sets.

## Related Specs
- `APP.THEME.001`
- `APP.THEME.003`
- `APP.THEME.004`
- `APP.THEME.005`
- `ACCOUNT.PROFILE.001`
