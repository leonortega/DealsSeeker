---
name: DealsSeeker
description: Material 3 default design system on Android. Three palette seeds generate M3 color roles in light and dark; no authored brand world sits above them.
colors:
  source: "Material 3 color roles generated from a single seed per palette variant (TONAL_SPOT, standard contrast)"
  primary: "{m3.primary}"
  on-primary: "{m3.onPrimary}"
  primary-container: "{m3.primaryContainer}"
  on-primary-container: "{m3.onPrimaryContainer}"
  secondary: "{m3.secondary}"
  on-secondary: "{m3.onSecondary}"
  secondary-container: "{m3.secondaryContainer}"
  on-secondary-container: "{m3.onSecondaryContainer}"
  tertiary: "{m3.tertiary}"
  on-tertiary: "{m3.onTertiary}"
  tertiary-container: "{m3.tertiaryContainer}"
  on-tertiary-container: "{m3.onTertiaryContainer}"
  surface: "{m3.surface}"
  on-surface: "{m3.onSurface}"
  surface-container: "{m3.surfaceContainer}"
  surface-container-low: "{m3.surfaceContainerLow}"
  surface-container-high: "{m3.surfaceContainerHigh}"
  surface-container-highest: "{m3.surfaceContainerHighest}"
  surface-variant: "{m3.surfaceVariant}"
  on-surface-variant: "{m3.onSurfaceVariant}"
  outline: "{m3.outline}"
  outline-variant: "{m3.outlineVariant}"
  error: "{m3.error}"
  on-error: "{m3.onError}"
  error-container: "{m3.errorContainer}"
  on-error-container: "{m3.onErrorContainer}"
  inverse-surface: "{m3.inverseSurface}"
  inverse-on-surface: "{m3.inverseOnSurface}"
  scrim: "{m3.scrim}"
typography:
  source: "Material 3 type scale (Display, Headline, Title, Body, Label; Large/Medium/Small and emphasized variants)"
  display-large: "{m3.displayLarge}"
  display-medium: "{m3.displayMedium}"
  display-small: "{m3.displaySmall}"
  headline-large: "{m3.headlineLarge}"
  headline-medium: "{m3.headlineMedium}"
  headline-small: "{m3.headlineSmall}"
  title-large: "{m3.titleLarge}"
  title-medium: "{m3.titleMedium}"
  title-small: "{m3.titleSmall}"
  body-large: "{m3.bodyLarge}"
  body-medium: "{m3.bodyMedium}"
  body-small: "{m3.bodySmall}"
  label-large: "{m3.labelLarge}"
  label-medium: "{m3.labelMedium}"
  label-small: "{m3.labelSmall}"
rounded:
  none: "0"
  xs: "{m3.shapeExtraSmall}"
  sm: "{m3.shapeSmall}"
  md: "{m3.shapeMedium}"
  lg: "{m3.shapeLarge}"
  xl: "{m3.shapeExtraLarge}"
  "2xl": "{m3.shapeExtraExtraLarge}"
  full: "{m3.shapeFull}"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
components:
  app-bar: "Material 3 app bar pattern on every destination"
  navigation: "Material 3 navigation bar at compact width; navigation rail or drawer at expanded width"
  buttons: "Material 3 filled, tonal, outlined and text button patterns"
  cards: "Material 3 card pattern with tonal surface and M3 shape token"
  inputs: "Material 3 text field pattern with M3 shape token"
  status: "Material 3 snackbar pattern, one status surface at a time"
---

# Design System: DealsSeeker

## Replacement notice

**This is a replacement, not a refinement.** The authored "Trail Map" brand world is retired as the governing identity. It is not being polished, restyled, or carried forward as a layer over Material 3. Material 3 defaults are now the authoritative design system for the Android phase: M3 color roles, the M3 type scale, M3 shape tokens, M3 tonal elevation, M3 motion physics and M3 component behavior govern every surface. The former brand rules — the waypoint accent, the night footer, the status-text rule, the landmark serif rule, the grounded-shadow rule and the pill rule — no longer define the UI and must not be reintroduced as overrides.

Behavior, copy semantics, privacy and interaction guarantees are explicitly out of scope of this replacement and remain unchanged (see [Behavior, copy and privacy](#behavior-copy-and-privacy-unchanged)).

## Overview

DealsSeeker on Android uses Material 3 as its single design system. A seed color is passed through Material 3 color generation to produce a complete set of semantic roles; those roles — not a hand-authored palette — are the app's colors. Components are the Material 3 patterns supplied by the platform Material 3 component library, using their default interaction, state and accessibility behavior. No second accent language, second typeface family, second shadow vocabulary or second shape language is layered on top.

The three previously authored palette worlds survive only as **seed variants**: each contributes a seed color to the same Material 3 color generator, and each resolves to the same role structure in light and dark. They are inputs to the system, not separate visual identities.

## Seed variants

The Material 3 color scheme for each variant is generated with the `TONAL_SPOT` variant and standard contrast from a single seed. All three resolve to the same M3 roles, so switching a seed changes role values, never the role structure or component behavior.

| Variant | Seed | Appearances | Role structure |
|---|---|---|---|
| Golden Hour / Lantern | `#b0512c` | light + dark | Identical M3 role set |
| Sunshine Market / Night Market | `#e8a13a` | light + dark | Identical M3 role set |
| Tangerine & Mint / Cozy Dark | `#ce4719` | light + dark | Identical M3 role set |

A seed is never used directly as a text, fill or icon color. Only the generated roles are used. Dynamic color from the device wallpaper may replace the seed-derived scheme where available; its static fallback uses the same roles and contrast guarantees.

## Color

M3 color roles are the app colors. There is one accent language: the generated `primary` family, used by Material 3 components in their standard roles (filled buttons, active navigation indicator, selected controls). `secondary`, `tertiary`, `surface` and the semantic `error` role carry their own M3-assigned meanings; none is repurposed as a second accent.

The generated role sets for the three seeds, light and dark, are recorded here. The full set — primary/secondary/tertiary container and fixed roles, all `surfaceContainer` levels, `surfaceTint`, `outlineVariant`, inverse, scrim and shadow roles — is available to Material 3 components.

| Variant | Seed | Appearance | primary | onPrimary | primaryContainer | onPrimaryContainer | secondary | tertiary | surface | onSurface | surfaceContainer | outline | error |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Golden Hour / Lantern | `#b0512c` | light | `#8f4c33` | `#ffffff` | `#ffdbcf` | `#72351e` | `#77574c` | `#695e2f` | `#fff8f6` | `#231a16` | `#fceae4` | `#85736d` | `#ba1a1a` |
| Golden Hour / Lantern | `#b0512c` | dark | `#ffb59b` | `#55200a` | `#72351e` | `#ffdbcf` | `#e7bdb0` | `#d5c68e` | `#1a110f` | `#f1dfd9` | `#271d1a` | `#a08d86` | `#ffb4ab` |
| Sunshine Market / Night Market | `#e8a13a` | light | `#815512` | `#ffffff` | `#ffddb6` | `#643f00` | `#705b40` | `#53643e` | `#fff8f4` | `#211a13` | `#f9ecdf` | `#827568` | `#ba1a1a` |
| Sunshine Market / Night Market | `#e8a13a` | dark | `#f6bc70` | `#462a00` | `#643f00` | `#ffddb6` | `#dec2a2` | `#bacd9f` | `#18120c` | `#ede0d4` | `#251e17` | `#9c8e80` | `#ffb4ab` |
| Tangerine & Mint / Cozy Dark | `#ce4719` | light | `#8f4c37` | `#ffffff` | `#ffdbd0` | `#723522` | `#77574d` | `#6b5e2f` | `#fff8f6` | `#231917` | `#fceae5` | `#85736e` | `#ba1a1a` |
| Tangerine & Mint / Cozy Dark | `#ce4719` | dark | `#ffb59f` | `#561f0e` | `#723522` | `#ffdbd0` | `#e7bdb1` | `#d8c68d` | `#1a110f` | `#f1dfda` | `#271d1b` | `#a08c87` | `#ffb4ab` |

Rules:

- Use roles, not literals. No raw hex value is used for app chrome; a role token exists for every surface, text, outline and status color.
- Verify contrast for **all six seed/appearance sets** (three seeds × light/dark). Text and essential control glyph contrast is measured against their role surfaces and recorded with the theme audit.
- Status is never color-alone. A status badge, snackbar or field error conveys meaning in text, with an icon where one exists; `error` and on-error roles carry the visual distinction.
- There is no fixed authored footer surface and no fixed immersive backdrop. Navigation, immersive surfaces and sheets use the active scheme's tonal surface roles like every other surface.

## Typography

The Material 3 type scale is the only type system. Its roles — Display, Headline, Title, Body and Label in Large, Medium and Small, plus emphasized variants — cover every string in the app. The M3 default typeface is used for all roles; there is no second face and no serif landmark exception. Emphasized variants are reserved for selection, actions, headlines and other editorial emphasis; Material 3 components do not use them by default.

| Family | Large | Medium | Small | Use |
|---|---|---|---|---|
| Display | 57 / 64 | 45 / 52 | 36 / 44 | Rare brand-scale moments |
| Headline | 32 / 40 | 28 / 36 | 24 / 32 | Screen and section titles |
| Title | 22 / 28 | 16 / 24 | 14 / 20 | Emphasized rows and action labels |
| Body | 16 / 24 | 14 / 20 | 12 / 16 | Reading copy and metadata |
| Label | 14 / 20 | 12 / 16 | 11 / 16 | Controls, tags and captions |

Roles are tokenized and expressed in scalable units so text follows the system reading-size setting, including sizes beyond 1.2×. Long localized strings wrap at word boundaries; no role is capped at a fixed maximum scale. Line height may adapt to the script. No hand-picked per-screen font size replaces a role.

## Shape

M3 shape tokens govern corners. Rectangles are fully rounded by default in Material 3; "fully rounded" means the M3 `full` token, not half the element's height used as a brand pill rule. Component shapes come from the M3 shape scale and are applied by the component pattern, not assigned per view.

| Token | Use |
|---|---|
| `shapeExtraSmall` / `shapeSmall` | Small controls and chips where M3 specifies |
| `shapeMedium` / `shapeLarge` | Text fields, cards and containers |
| `shapeExtraLarge` / `shapeExtraExtraLarge` | Large surfaces, sheets and dialogs |
| `shapeFull` | Controls M3 defines as fully rounded (for example navigation indicators and certain chips) |

Structural panels and the controls they contain use the shape tokens their Material 3 component patterns specify. There is no separate "pill" language for tags, badges, filters or search; no authored 12–28px corner convention overrides the tokens. Cards clip their content to their M3 shape.

## Elevation & depth

Elevation is tonal, not shadow-based. Material 3 surfaces are differentiated with `surface`, `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh` and `surfaceContainerHighest` roles; their tone, not a cast shadow, communicates hierarchy. On Android, Paper `Surface` and its elevation tokens supply the raised tonal level for cards, sheets, dialogs and menus, where the component pattern calls for one.

There is no single authored ambient card shadow, no stacked shadows and no hard-offset shadows. Scrims use the M3 `scrim` role. Immersive surfaces use the active scheme's tonal surface roles rather than a fixed dark backdrop; overlay text uses the matching on-surface role so it stays legible in both appearances.

## Motion

Motion follows Material 3 physics: spring-based transitions described by stiffness, damping and initial velocity replace hand-authored duration/easing curves. The standard preset (minimal bounce) is the default across the product; the expressive preset is reserved for deliberate moments. Spatial tokens (position, rotation, size, corner radius) may overshoot; effect tokens (color, opacity) do not. Token values adapt to device class.

The system **Remove animations** setting is honored: when it is enabled, transitions resolve to their final state through an immediate change or a non-animated crossfade, with the same information and controls available. Removing motion never removes function.

## Material Symbols vocabulary

Android uses the Material Symbols set obtained by keyword lookup from the Design MCP `search_icons` tool rather than guessed names. Verified names for DealsSeeker's roles:

| Role | Verified symbol name |
|---|---|
| Discover / explore | `explore` |
| Current location / recenter | `near_me` |
| Locate me / device target | `my_location` |
| Directions / navigation | `directions` |
| Save / favorite | `favorite` |
| Report / flag | `report` |
| Comments / chat | `chat` |
| Create / add | `add` |
| Search | `search` |
| Help / support | `help` |
| Availability vote | `thumb_up` |
| Available / confirmed | `event_available` |

Each distinct meaning uses a distinct verified name; one screen never uses the same symbol for two different controls. Legacy icon sets, authored SVG action glyph sets and emoji are not control symbols. Placeholder imagery and user-supplied avatar artwork are product content, not control symbols.

## Components

Material 3 component patterns are used for all shell chrome and content widgets, with their default behavior, states and accessibility semantics. The library's defaults are authoritative for styling: no authored brand role overrides them.

- **App bars:** A Material 3 app bar pattern is present on every destination — standard tabs, overlay destinations and the immersive presentation alike. It names the current page and holds its essential actions; no destination is headerless. On scroll, app bars use a color fill rather than a drop shadow.
- **Navigation:** A Material 3 navigation bar at compact width (three to five equal-importance destinations, active indicator, no drop shadow); a Material 3 navigation rail or drawer at expanded width. The active destination is marked by the M3 pattern's active indicator, not an authored tile.
- **Buttons:** Material 3 filled, tonal, outlined and text button patterns, taking their colors from the active role set. No variant introduces a second accent.
- **Chips, cards, text fields, switches, checkboxes and radios:** Material 3 patterns with their standard states, using M3 shape and color tokens.
- **Sheets and dialogs:** Material 3 bottom sheet and dialog patterns for focused sub-tasks and interrupting decisions. Only one sheet modality is used; dialogs are reserved for decisions that must interrupt.
- **Status:** A Material 3 snackbar pattern is the single status surface. It may be temporary or persist until acted on; the explicit Done/Undo status surface uses the non-dismissive form.
- **Create action:** A single floating action button outside the navigation surface, reserved for the Create action and hidden while a sheet is open.
- **Gallery / action controls:** Material 3 icon buttons and buttons, preserving accessibility state and touch floors through the component patterns.

## Layout

Mobile-first, edge-to-edge. Status bar, navigation bar, display cutout and IME insets are applied so no control or label is hidden. 16–20px outer padding, 8–14px gaps between sibling controls and 24px of bottom breathing room remain as layout guidance; cards stack at 8–14px intervals. Values are expressed in density-independent units on Android. There is no separate desktop grid; the same phone-first composition is used at every width, with navigation adapting from bar to rail/drawer.

## Behavior, copy and privacy (unchanged)

The replacement changes the design system only. The following remain exactly as previously specified:

- The application name is shown as localized, theme-aware text wherever it is shown; no placeholder identity imagery remains.
- Splash and startup surfaces present a single application identity with no duplicated title, subtitle or second logo; launch and splash surfaces follow the active appearance.
- Offer action labels, feedback copy, help, undo, recents, draft recovery, contextual help and validation copy keep their established semantics.
- At most one transient status surface is present at a time, in one consistent location; status meaning is never conveyed by color alone.
- Guest/authentication rules, session persistence, navigation state restoration, modality dismissal and focus return are unchanged.
- Keyboard/IME avoidance, touch floors and accessible names, roles and actions are unchanged.
- **Coordinate privacy:** Add Offer and Offers views do not expose raw coordinates. Location is conveyed through resolved, user-facing descriptions; no raw latitude or longitude value is presented or logged by these views.

## Do's and Don'ts

### Do:
- **Do** use Material 3 color roles as the only app colors and verify contrast for all three seeds in both appearances.
- **Do** use the M3 type scale roles with the default typeface, with no serif or second-family exception.
- **Do** use M3 shape tokens, including `full` where Material 3 specifies, and tonal elevation for depth.
- **Do** use Material 3 motion physics and honor the system Remove animations setting.
- **Do** put a Material 3 app bar on every destination and use the M3 navigation bar/rail with Material Symbols.
- **Do** keep the behavior, copy and privacy rules above unchanged.

### Don't:
- **Don't** reintroduce the Trail Map north star, the waypoint accent, the night footer, a status-text color rule, a landmark serif, a single ambient shadow or a pill-only shape language.
- **Don't** add a second accent, a second typeface, a second shadow vocabulary or a second shape language.
- **Don't** hardcode a surface color where an M3 role exists, or let an authored exception replace a generated role.
- **Don't** add a hand-built imitation of a Material 3 component pattern or a second status, sheet or dialog system.
- **Don't** expose raw coordinates in Add Offer or Offers views.
