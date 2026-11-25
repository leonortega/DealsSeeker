# Spec: `APP.THEME.004`

## Metadata
- **Title**: Sunshine Market Visual World
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Replace the green-and-terracotta palette with a cheerful amber, plum and mint identity while keeping the wayfinding logic and contrast floors.

## Preconditions
- The active theme is light (Sunshine Market) or dark (Night Market).

## Trigger
- Any palette role, footer surface or immersive backdrop is painted.

## Requirements
- `APP.THEME.004-R1`: The light theme shall use cream surfaces, deep plum ink and sunny amber as the wayfinding accent; the dark theme shall use plum-charcoal surfaces, warm off-white ink and a brighter lantern-amber accent.
- `APP.THEME.004-R2`: Mint shall be the secondary surface role and coral the reserved offer highlight; neither shall become a wayfinding accent.
- `APP.THEME.004-R3`: Text on the accent shall use `onAccent` — deep plum in both themes — and text on danger shall use `onDanger` — white in light and deep plum in dark.
- `APP.THEME.004-R4`: Selected chips and filters shall use accent fill with `onAccent` text or accent-muted fill with `accentText`; this keeps selected labels at least 4.5:1 against the muted fill in both themes.
- `APP.THEME.004-R5`: Body text shall keep at least 4.5:1 contrast and control boundaries at least 3:1 in both themes.
- `APP.THEME.004-R6`: The bottom navigation shall always use the fixed night-plum surface `#2a2030` with a `#8c7a93` hairline, in both themes, with the amber family only on its active tile.
- `APP.THEME.004-R7`: The immersive presentation shall use the fixed plum backdrop `#181421` in both themes, replacing the previous forest backdrop.
- `APP.THEME.004-R8`: Primary actions, selected tabs, selected chips and the active indicator shall still use the single accent role.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Main colors are amber and plum
  Given any theme is active
  When a view is rendered
  Then primary actions use amber with deep plum text
  And secondary panels use mint
  And offer highlights use coral with deep plum text

Scenario: Night navigation stays consistent
  Given either theme is active
  When the shared footer is rendered
  Then it uses the fixed night-plum surface and hairline
  And only its active tile uses the amber family

Scenario: Contrast floors hold
  Given any theme is active
  When text, chips and controls are rendered
  Then body text keeps at least 4.5:1 contrast
  And control boundaries keep at least 3:1 contrast
```

## Example Inputs/Outputs
- Example input: light theme with a selected radius chip.
- Expected output: amber-mute chip fill with deep plum text, not amber text.

## Edge Cases
- Reported and promoted badges on the same card.
- Destructive actions in light and dark themes.
- Large text on coral highlight badges.
- Immersive overlays over photography.

## Non-Functional Constraints
- Reuse existing palette roles; do not add a new component library.

## Related Specs
- `APP.THEME.001`
- `APP.THEME.003`
- `APP.THEME.005`
- `APP.SHELL.001`
- `OFFERS.FEED.IMMERSIVE.001`
