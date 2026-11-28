# Spec: `APP.BRAND.001`

## Metadata
- **Title**: Material 3 Default Application Identity
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell (all views), Login, Offers (all presentations)
- **Priority**: Medium

## Purpose
Use Material 3 component library defaults as the authoritative application identity and retire the authored brand-specific placements and glyph set.

## Preconditions
- The platform Material 3 component library is the single source of visual defaults.
- An active Material 3 color scheme and type scale are available as defined by `APP.THEME.001` and `APP.TYPOGRAPHY.001`.

## Trigger
- A startup, splash, login, navigation, top-bar or action surface is rendered.

## Requirements
- `APP.BRAND.001-R1`: The system shall use the Material 3 component library defaults as the authoritative identity on every surface; no authored brand overlay shall restyle those defaults.
- `APP.BRAND.001-R2`: The application name shall remain shown as localized, theme-aware text wherever the name is displayed.
- `APP.BRAND.001-R3`: The system shall not display placeholder identity imagery or a placeholder letter glyph as application identity.
- `APP.BRAND.001-R4`: Startup, splash and launcher surfaces shall present a single application identity without an authored lockup placement rule, and shall not duplicate the application title, subtitle or a second identity mark.
- `APP.BRAND.001-R5`: Action glyphs shall use the verified Material Symbols vocabulary from the Material 3 icon set; emoji, legacy icon sets and an authored action glyph set shall not be used as control symbols.
- `APP.BRAND.001-R6`: Top bars and navigation controls shall use Material 3 component patterns with their default structure; no authored symbol-mark placement beside a presentation switch, no authored rounded mark tile and no requirement to mirror one presentation's top bar into another shall apply.
- `APP.BRAND.001-R7`: Identity text and artwork shall take their color and type from the active Material 3 color roles and type scale roles, not from a second brand role set, as defined by `APP.THEME.001` and `APP.TYPOGRAPHY.001`.
- `APP.BRAND.001-R8`: Retired brand rules — the waypoint accent, the night footer surface, authored lockup placements and the authored glyph set — shall not be applied as overrides to any Material 3 component.
- `APP.BRAND.001-R9`: This spec replaces the prior brand-placement requirements; it is a replacement rather than a refinement, and the behavior, copy and privacy rules it preserves shall remain unchanged.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Material 3 defaults define identity on every surface
  Given the platform Material 3 component library is active
  When a startup, splash, login, navigation or action surface is rendered
  Then its identity treatment follows the Material 3 component defaults
  And no authored brand overlay restyles those defaults

Scenario: Application name stays localized theme-aware text
  Given the user has not reached the authenticated shell
  When the splash or login view is rendered
  Then the localized application name is shown as text
  And the text follows the active Material 3 color and type roles

Scenario: No placeholder identity is shown
  Given any application surface is rendered
  When identity imagery is displayed
  Then no placeholder letter glyph or placeholder image is shown

Scenario: Startup surfaces present one identity
  Given the application is launching
  When the startup or splash surface is rendered
  Then a single application identity is displayed
  And no duplicate title, subtitle or second identity mark is displayed

Scenario: Action glyphs use Material Symbols
  Given an offer card or action rail is displayed
  When its actions are rendered
  Then each control uses a verified Material Symbol
  And no emoji, legacy icon set or authored glyph set is used as an action icon

Scenario: Top bars use Material 3 structure without authored mark placement
  Given the user is on a standard or immersive Offers presentation
  When the top bar is rendered
  Then it uses the Material 3 app bar pattern with its default control structure
  And no authored mark tile or mark-beside-switch placement is required

Scenario: Identity survives seed and appearance changes
  Given any of the three palette seeds in light or dark appearance
  When identity text and artwork are rendered
  Then they use the active Material 3 roles
  And no second accent or second typeface is introduced

Scenario: Narrow viewport keeps a single identity
  Given an immersive presentation on a narrow viewport
  When the top bar is rendered
  Then exactly one application identity is shown
  And no control is clipped by the screen edges

Scenario: Retired brand rules do not return as overrides
  Given a Material 3 component with a default color, shape and elevation
  When a former brand rule would change that default
  Then the Material 3 default governs
  And the waypoint accent, night footer and authored glyph set are not reapplied
```

## Example Inputs/Outputs
- Example input: Login view rendered in Spanish in the dark appearance of a seed variant.
- Expected output: The localized application name appears as text in the active Material 3 roles; no placeholder glyph and no second accent.
- Example input: Immersive presentation rendered on a narrow viewport.
- Expected output: One identity, a Material 3 app bar with default controls, and no clipped control.

## Edge Cases
- A former brand placement rule would insert a symbol mark into a top bar; the Material 3 app bar structure wins.
- A device font does not include a verified symbol name; a visually equivalent Material Symbol is used without changing the control's meaning.
- The dark appearance of any seed keeps identity text legible through M3 roles rather than a fixed brand color.
- A launcher surface has no room for a secondary lockup; the single identity remains.

## Non-Functional Constraints
- Identity treatment shall be expressed through Material 3 roles and component defaults; no raw brand color literal shall be introduced.
- Behavior, copy semantics and coordinate privacy shall remain unchanged by this replacement.

## Related Specs
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
- `APP.THEME.001`
- `APP.TYPOGRAPHY.001`
- `APP.POLISH.UX.001`
- `APP.SHELL.001`
- `APP.SYMBOL.VOCABULARY.001`
- `OFFERS.FEED.RESPONSIVE.001`
