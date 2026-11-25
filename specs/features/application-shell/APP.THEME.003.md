# Spec: `APP.THEME.003`

## Metadata
- **Title**: Golden Hour and Lantern Palettes
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Give the light and dark themes a warmer, more optimistic palette while keeping the Trail Map identity and contrast floors.

## Preconditions
- The active theme is light (Golden Hour) or dark (Lantern).

## Trigger
- Any palette role is painted on a surface, control, badge or text label.

## Requirements
- `APP.THEME.003-R1`: The light theme shall use warm paper and cream surfaces with a deepened terracotta accent; the dark theme shall use deep pine surfaces with a brighter ember accent.
- `APP.THEME.003-R2`: Body and metadata text shall keep at least 4.5:1 contrast against its surface, and control boundaries at least 3:1.
- `APP.THEME.003-R3`: Text on the accent shall use a dedicated `onAccent` role — white in light theme, forest ink in dark theme — so primary actions stay legible in both.
- `APP.THEME.003-R4`: A reserved `highlight` role (honey in light, lantern gold in dark) shall be used only for offer signals such as promoted badges, with `onHighlight` forest ink text.
- `APP.THEME.003-R5`: The highlight role shall not replace the terracotta waypoint accent for primary actions, selected tabs, selected chips or the active indicator.
- `APP.THEME.003-R6`: The Night Footer Rule surfaces shall remain unchanged in both themes.
- `APP.THEME.003-R7`: Success, danger and muted text roles shall keep their semantic meaning and meet the contrast floors of R2.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Light theme feels like golden hour
  Given the light theme is active
  When a view is rendered
  Then surfaces use warm paper and cream tones
  And primary actions use deep terracotta with white text
  And promoted offers use the honey highlight with dark ink text

Scenario: Dark theme feels like a lantern
  Given the dark theme is active
  When a view is rendered
  Then surfaces use deep pine and soft sage tones
  And primary actions use bright ember with dark forest ink text
  And the footer keeps its fixed night surface

Scenario: Contrast floors hold in both themes
  Given any theme is active
  When text, controls and badges are rendered
  Then body text keeps at least 4.5:1 contrast
  And control boundaries keep at least 3:1 contrast
```

## Example Inputs/Outputs
- Example input: dark theme with a primary "Search" button.
- Expected output: ember `#FF9E6B` fill with forest-ink text, not white text.

## Edge Cases
- Selected chips in both themes.
- Destructive actions with danger fill.
- Promoted and reported badges together on one card.
- Large text and localized labels on highlighted badges.

## Non-Functional Constraints
- No new color values beyond this palette; existing palette roles shall be reused.

## Related Specs
- `APP.THEME.001`
- `APP.THEME.002`
- `APP.POLISH.UX.001`
- `OFFERS.FEED.PROMOTED.001`
