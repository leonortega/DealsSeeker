# Spec: `APP.TYPOGRAPHY.001`

## Metadata
- **Title**: Landmark Typography Across Platforms
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, all views
- **Priority**: Medium

## Purpose
Make the design system's landmark voice render as a serif on every shipped platform while operational text stays on the system sans.

## Preconditions
- A view, modal, sheet or offer card is rendered on iOS or Android.
- The active theme is light or dark.

## Trigger
- A brand moment, screen title, offer name, section title or dialog title is displayed.

## Requirements
- `APP.TYPOGRAPHY.001-R1`: Landmark text shall render with a serif face on both iOS and Android; the authored Georgia face shall be used where the platform provides it and an equivalent platform serif shall be used otherwise.
- `APP.TYPOGRAPHY.001-R2`: Body copy, metadata, tags, badges, buttons and labels shall remain on the system sans face.
- `APP.TYPOGRAPHY.001-R3`: Landmark weight and hierarchy shall follow `DESIGN.md`; changing the family shall not change which text is a landmark.
- `APP.TYPOGRAPHY.001-R4`: Long localized landmark text shall wrap or truncate without clipping or overlapping adjacent controls.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Landmarks render as serif on both platforms
  Given the same landmark text is displayed on iOS and Android
  When the views are rendered
  Then both platforms show a serif face for that text
  And the hierarchy matches DESIGN.md

Scenario: Operational text stays sans
  Given a view with descriptions, metadata and buttons
  When the view is rendered
  Then those strings use the system sans face

Scenario: Long localized headline does not break the layout
  Given a landmark string substantially longer than its English source
  When it is rendered at 200 percent text size
  Then it wraps or truncates without clipping or overlapping controls
```

## Example Inputs/Outputs
- Example input: "Nearby offers" rendered on Android.
- Expected output: a serif headline at the documented weight, not the system sans.
- Example input: an offer description beside that headline.
- Expected output: description remains on the system sans.

## Edge Cases
- A platform that does not provide the authored face by name.
- Large text sizes with long localized headlines.
- High-contrast dark theme where serif strokes are thin.

## Non-Functional Constraints
- No new font asset or runtime dependency is required when an equivalent platform serif is available.
- The change is typographic only; copy, layout and interaction stay unchanged.

## Related Specs
- `APP.BRAND.001`
- `APP.SHELL.002`
- `APP.ACCESSIBILITY.UX.001`
