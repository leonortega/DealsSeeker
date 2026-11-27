# Spec: `APP.TYPOGRAPHY.001`

## Metadata
- **Title**: Landmark Typography and Reading-Size Scaling Across Platforms
- **Version**: `v2.0`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Keep the design system's landmark serif voice on every shipped platform while every text role follows the user's reading-size setting beyond a 1.2× cap.

## Preconditions
- A view, modal, sheet or offer card is rendered on iOS or Android.
- The active theme is light or dark.
- The system reading-size setting may be at its default or a larger value.

## Trigger
- A brand moment, screen title, offer name, section title, dialog title, label or body string is displayed.

## Requirements
- `APP.TYPOGRAPHY.001-R1`: Landmark text shall render with a serif face on both iOS and Android; the authored Georgia face shall be used where the platform provides it and an equivalent platform serif shall be used otherwise.
- `APP.TYPOGRAPHY.001-R2`: Body copy, metadata, tags, badges, buttons and labels shall remain on the system sans face.
- `APP.TYPOGRAPHY.001-R3`: Landmark weight and hierarchy shall follow `DESIGN.md`; changing the family shall not change which text is a landmark.
- `APP.TYPOGRAPHY.001-R4`: Long localized landmark and label text shall wrap at word boundaries rather than truncate; no glyph shall be clipped by its container.
- `APP.TYPOGRAPHY.001-R5`: Text shall follow the user's system reading-size setting beyond a 1.2× cap; no fixed maximum scale shall prevent meaningful growth at the largest system setting.
- `APP.TYPOGRAPHY.001-R6`: Text sizes shall be derived from the platform's reading-size setting rather than fixed per-screen values, so every role grows with the user's choice on both platforms.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Landmarks render as serif on both platforms
  Given the same landmark text is displayed on iOS and Android
  When the views are rendered
  Then both platforms show a serif face for that text
  And the hierarchy matches the design system

Scenario: Operational text stays sans
  Given a view with descriptions, metadata and buttons
  When the view is rendered
  Then those strings use the system sans face

Scenario: Text scales beyond 1.2x with the system setting
  Given the system reading size is set to twice the default
  When landmark, label and body text are rendered
  Then each grows with the setting
  And no cap limits growth at 1.2 times the default

Scenario: Long localized headline wraps rather than truncates
  Given a landmark string substantially longer than its English source
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
  Then the heading keeps its serif landmark role
  And the body stays on the sans face and wraps without overlap
```

## Example Inputs/Outputs
- Example input: "Nearby offers" rendered on Android.
- Expected output: a serif headline at the documented weight, not the system sans.
- Example input: an offer description beside that headline.
- Expected output: description remains on the system sans.
- Example input: system reading size set to 200 percent.
- Expected output: headline, body and labels grow past 1.2 times and wrap without clipping.

## Edge Cases
- A platform that does not provide the authored face by name.
- Large text sizes with long localized headlines.
- High-contrast dark theme where serif strokes are thin.
- A single long unbroken localized token at the largest reading size.

## Non-Functional Constraints
- No new font asset or runtime dependency is required when an equivalent platform serif is available.
- The change is typographic only; copy, layout and interaction stay unchanged.

## Related Specs
- `APP.BRAND.001`
- `APP.SHELL.002`
- `APP.SHELL.005`
- `APP.ACCESSIBILITY.UX.001`
- `APP.PLATFORM.CHROME.001`
- `APP.ADAPTIVE.UX.002`
