# Spec: `APP.TYPOGRAPHY.001`

## Metadata
- **Title**: Material 3 Type Scale and Reading-Size Scaling
- **Version**: `v3.0`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Use the Material 3 type scale and its default typeface as the only typographic system, retiring the serif landmark exception, while text follows the user's reading-size setting beyond a 1.2× cap.

## Preconditions
- A view, sheet, dialog or offer card is rendered.
- The active theme is light or dark.
- The system reading-size setting may be at its default or a larger value.

## Trigger
- A screen title, offer name, section title, dialog title, label or body string is displayed.

## Requirements
- `APP.TYPOGRAPHY.001-R1`: All text shall render with the Material 3 default typeface; no serif landmark face, Georgia, Roboto Serif or other second typeface family shall be used for any text role.
- `APP.TYPOGRAPHY.001-R2`: Every role — Display, Headline, Title, Body and Label — shall share the same Material 3 typeface; there shall be no brand/plain face split and no string class that changes face.
- `APP.TYPOGRAPHY.001-R3`: Visual hierarchy shall come solely from Material 3 type roles, their sizes, weights and line heights as defined by `DESIGN.md`; no authored landmark weight or hierarchy rule shall apply.
- `APP.TYPOGRAPHY.001-R4`: Long localized text shall wrap at word boundaries rather than truncate; no glyph shall be clipped by its container.
- `APP.TYPOGRAPHY.001-R5`: Text shall follow the user's system reading-size setting beyond a 1.2× cap; no fixed maximum scale shall prevent meaningful growth at the largest system setting.
- `APP.TYPOGRAPHY.001-R6`: Text sizes shall be derived from the platform's reading-size setting rather than fixed per-screen values, so every role grows with the user's choice on both platforms.
- `APP.TYPOGRAPHY.001-R7`: Text shall map to the Material 3 type scale tokens — Display, Headline, Title, Body and Label, each in Large, Medium and Small — so no ad-hoc per-screen font size replaces a role.
- `APP.TYPOGRAPHY.001-R8`: Emphasized scale variants shall be used only where Material 3 guidance calls for selection, actions, headlines or editorial emphasis; component defaults shall stay on the regular scale tokens.
- `APP.TYPOGRAPHY.001-R9`: Line height may adapt to the language script, and all roles shall use scalable units so the system reading-size setting is honored without clipping or overlap.
- `APP.TYPOGRAPHY.001-R10`: This is a replacement of the prior serif-landmark typography, not a refinement; copy, behavior and coordinate privacy shall remain unchanged, as defined by `APP.BRAND.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: All text uses the Material 3 default typeface
  Given the same screen is displayed on iOS and Android
  When the views are rendered
  Then every text role uses the Material 3 default typeface
  And no serif, Georgia or Roboto Serif face appears

Scenario: No brand and plain face split remains
  Given a view with titles, descriptions, metadata and buttons
  When the view is rendered
  Then all strings share the same typeface
  And no string class changes face by brand role

Scenario: Text scales beyond 1.2x with the system setting
  Given the system reading size is set to twice the default
  When title, label and body text are rendered
  Then each grows with the setting
  And no cap limits growth at 1.2 times the default

Scenario: Long localized title wraps rather than truncates
  Given a title string substantially longer than its English source
  When it is rendered at 200 percent text size
  Then it wraps at word boundaries rather than truncating
  And no glyph is clipped or overlaps a control

Scenario: Labels wrap at the largest system reading size
  Given the system reading size is at its largest setting
  When button and navigation labels are rendered
  Then they wrap at word boundaries rather than truncate
  And no label is clipped by its container

Scenario: Hierarchy survives large-scale mixed text
  Given a heading and its body copy at the largest reading size
  When they are rendered together
  Then the heading keeps its Material 3 type role
  And the body stays on the same typeface and wraps without overlap

Scenario: Material 3 type scale covers every text role
  Given screens with display, headline, title, body and label text
  When their text is rendered
  Then each maps to a Material 3 type scale token in Large, Medium or Small
  And no hand-picked per-screen size replaces a token

Scenario: Emphasized variants are used for emphasis only
  Given component labels and an editorial headline
  When text is rendered
  Then emphasized Material 3 variants appear only where emphasis is called for
  And component defaults stay on the regular scale tokens

Scenario: No legacy serif fallback is introduced
  Given a device where a serif face is available
  When text is rendered
  Then no text role selects that serif face
  And the Material 3 default face is used for every role

Scenario: Line height adapts without clipping
  Given a language script with tall glyphs at an elevated reading size
  When text is rendered
  Then the role's line height adapts to the script
  And no glyph is clipped or overlaps an adjacent row
```

## Example Inputs/Outputs
- Example input: "Nearby offers" rendered on Android.
- Expected output: a Material 3 title or headline role at the token's documented size using the M3 default typeface.
- Example input: an offer description beside that title.
- Expected output: description uses a Material 3 body role on the same typeface.
- Example input: system reading size set to 200 percent.
- Expected output: title, body and labels grow past 1.2 times and wrap without clipping.

## Edge Cases
- A platform offers a serif face by name; no text role selects it.
- Large text sizes with long localized strings.
- High-contrast dark appearance where thin strokes would reduce legibility; roles and contrast are preserved without changing face.
- A single long unbroken localized token at the largest reading size.
- A locale with tall script glyphs where default line height would clip.

## Non-Functional Constraints
- No new font asset or runtime dependency is required to preserve a former serif face.
- The change is typographic only; copy, layout, interaction and coordinate privacy stay unchanged.

## Related Specs
- `APP.BRAND.001`
- `APP.PLATFORM.CHROME.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
- `APP.THEME.001`
- `APP.POLISH.UX.001`
- `APP.PERFORMANCE.PROFILE.001`
- `APP.ADAPTIVE.LANDSCAPE.001`
- `APP.ACCESSIBILITY.UX.001`
- `APP.ADAPTIVE.UX.002`
- `APP.SYMBOL.VOCABULARY.001`
