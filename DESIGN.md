---
name: DealsSeeker
description: Hyperlocal deal discovery and community upkeep in one warm, wayfinding-led design language.
colors:
  warm-paper: "#f4efe6"
  paper-raised: "#efe5d8"
  cream-panel: "#fff9f0"
  sage-panel: "#e6f0e6"
  card-cream: "#fffdf8"
  sand-border: "#d7c9b5"
  forest-ink: "#1f3128"
  slate-ink: "#5f6d63"
  kiln-terracotta: "#b85c38"
  clay-blush: "#e9c9b8"
  field-success: "#2f6e46"
  brick-danger: "#8d2f2f"
  soft-shadow: "rgba(31, 49, 40, 0.18)"
  day-scrim: "rgba(22, 30, 28, 0.52)"
  night-paper: "#17201d"
  night-raised: "#22302b"
  night-panel: "#22332f"
  night-sage: "#2d4037"
  night-card: "#293a35"
  night-border: "#476258"
  dawn-ink: "#f7f1e8"
  mist-ink: "#c6d0c9"
  ember-accent: "#f08f62"
  clay-deep: "#5e3a2a"
  mint-success: "#7ec48c"
  rose-danger: "#f08f8f"
  night-shadow: "rgba(0, 0, 0, 0.3)"
  night-scrim: "rgba(4, 7, 6, 0.66)"
  trail-forest: "#1b2f28"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.05
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "1.1px"
rounded:
  sm: "12px"
  md: "16px"
  lg: "18px"
  xl: "26px"
  "2xl": "28px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
components:
  button-primary:
    backgroundColor: "{colors.kiln-terracotta}"
    textColor: "#ffffff"
    rounded: "{rounded.2xl}"
    padding: "15px 20px"
  button-ghost:
    backgroundColor: "{colors.card-cream}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.md}"
    padding: "14px"
  offer-card:
    backgroundColor: "{colors.card-cream}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.card-cream}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.md}"
    padding: "14px"
  chip:
    backgroundColor: "{colors.sage-panel}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 10px"
  footer-tab-active:
    backgroundColor: "{colors.clay-deep}"
    textColor: "{colors.dawn-ink}"
    rounded: "{rounded.lg}"
    padding: "8px 2px"
---

# Design System: DealsSeeker

## Overview

**Creative North Star: "The Trail Map"**

DealsSeeker reads like a well-kept local trail map: warm paper ground, deep forest ink, and a single burnt-terracotta mark for the path you are on and the actions worth taking. The palette is deliberately earthy rather than corporate; discovery feels like consulting a guide someone left at the trailhead, not scanning a marketplace. The one accent is sparse on purpose — its rarity is what makes an active tab, a primary button, and a selected filter legible at a glance.

The typography follows the same cartographer's logic. Georgia acts as the landmark: it appears on the product name, screen titles, offer names, and the rare brand moment, never on the operational text that does the work. Everything else — descriptions, distances, tags, buttons, micro-labels — stays on the system sans, tight and unpretentious. Surfaces are generously rounded but never soft enough to lose structure; a single low shadow lifts offer cards off the page, and everything else is held in place by 1px borders and tonal steps.

The system ships one mobile-native language to iOS and Android from a single codebase. Two complete palettes cover light and dark: a daylight paper-and-forest scheme and a forest-night scheme for low-light browsing. The immersive photo feed is the deliberate exception — it is always laid on a fixed forest backdrop (`#1b2f28`), with the app name and logo present, so the imagery carries the moment and the interface recedes. No standalone logo file or documented voice guide exists in the project; the wordmark is set in Georgia and the mark is a rounded square.

**Key Characteristics:**
- Warm paper and forest green carry the structure; terracotta is the only wayfinding accent.
- Georgia for landmarks, system sans for everything operational.
- Generous 16–28px radii; chips, badges, and filters are full pills.
- One soft ambient shadow on raised cards; 1px borders and tonal shifts do the rest.
- Two full palettes (daylight and forest-night); the bottom navigation stays night-dark in both.
- Compact 700–800 weight micro-labels with wide tracking for metadata and actions.

## Colors

A cartographer's palette: paper and cream panels under forest-ink type, with one terracotta waypoint accent and a parallel forest-night set for dark mode.

### Primary
- **Kiln Terracotta** (`#b85c38` / dark `#f08f62`): The waypoint. Primary button fills, the active navigation tile's icon, the immersive tab indicator, and selected states. It marks the path — never the background.
- **Ember Accent** (`#f08f62`): The dark-mode terracotta, brightened to hold contrast against forest-night surfaces.

### Secondary
- **Sage Panel** (`#e6f0e6` / dark `#2d4037`): A quiet green tint for alternate panels and chip surfaces, giving status and grouping a place outside the accent.

### Tertiary
- **Clay Blush** (`#e9c9b8` / dark `#5e3a2a`): A muted terracotta family used for accent-muted fills — the active navigation tile's base and soft accent details.

### Neutral
- **Warm Paper** (`#f4efe6`): The daylight app background — the map's paper.
- **Paper Raised** (`#efe5d8`): A one-step warmer surface for raised daylight regions.
- **Cream Panel** (`#fff9f0`) and **Card Cream** (`#fffdf8`): Panels and cards that sit above the paper ground.
- **Forest Ink** (`#1f3128` / dark `#f7f1e8`): Primary text. Its dark-mode counterpart, Dawn Ink, is a warm off-white rather than pure white.
- **Slate Ink** (`#5f6d63` / dark `#c6d0c9`): Secondary text and inactive navigation labels, tinted from the same green family.
- **Sand Border** (`#d7c9b5` / dark `#476258`): The 1px hairline that defines panels and inputs without shadow.
- **Field Success** (`#2f6e46` / dark `#7ec48c`) and **Brick Danger** (`#8d2f2f` / dark `#f08f8f`): Status only — availability confirmation and errors.
- **Night Paper** (`#17201d`), **Night Panel** (`#22332f`), **Night Card** (`#293a35`): The forest-night surfaces.
- **Trail Forest** (`#1b2f28`): The fixed backdrop behind the immersive offer feed, independent of the active theme.

### Named Rules

**The Waypoint Rule.** Terracotta marks the path: primary actions, selected tabs, selected chips, the active indicator. It stays on a small fraction of any screen; paper and forest carry the rest.

**The Night Footer Rule.** The bottom navigation is always the forest-night surface (`#22332f` with a `#476258` hairline), in light and dark themes alike. Only its active tile adopts the terracotta family (`#5e3a2a` fill, `#f08f62` icon).

## Typography

**Display Font:** Georgia (with `Times New Roman`, serif fallback)
**Body Font:** System UI sans (San Francisco on iOS, Roboto on Android, Segoe UI on web)
**Label Font:** The same system sans at 700–800 with letter-spacing; no separate mono face is used.

**Character:** Georgia is the landmark voice — literary, warm, a little editorial — and it earns its place only on names and headlines. The system sans is the trail guide's handwriting: compact, legible, and quietly dense. The pairing keeps brand moments memorable without sacrificing scanability in the feed.

### Hierarchy
- **Display** (700, 42–44, line-height ~1.05): Brand moments only — splash wordmark and the authentication hero. Never used for content.
- **Headline** (Georgia 700, 24–30, line-height ~1.15): Screen titles, offer names, modal titles, form section headers.
- **Title** (system sans 800, 16–18): Primary button labels, selected tabs, emphasized metadata.
- **Body** (system sans 400, 14–15, line-height 20–22): Descriptions, comments, and supporting copy. Keep the measure short on mobile; on web, avoid stretching beyond a comfortable reading width.
- **Label** (system sans 700–800, 10–12, letter-spacing 0.6–1.5, often uppercase): Tags, badges, section markers, and action captions.

### Named Rules

**The Landmark Rule.** Georgia is reserved for names, headlines, and brand moments. Body copy, metadata, and controls stay on the system sans — a paragraph is never set in Georgia.

## Layout

Mobile-first and full-bleed: the primary surface is a vertical, edge-to-edge offer feed, with map and grid/list as alternate readings. Screens use 16–20px outer padding (20px on authentication and brand screens, 16–18px on list and detail surfaces), 8–14px gaps between sibling controls, and 24px of bottom breathing room. Cards stack at 8–14px intervals.

The bottom navigation floats above the content with 16px side margins and a 10px bottom inset, so it reads as a distinct rounded instrument rather than a system bar. In the immersive feed, overlay copy reserves 70–110px of right-side clearance so the action rail never crowds the business name or description.

Values are expressed in density-independent units (dp/sp) in the native code and map to CSS px on web. No separate desktop grid is defined: the same phone-first composition ships to both platforms rather than stretching the feed into a wide layout.

## Elevation & Depth

A restrained hybrid. Panels are flat and bounded by 1px hairlines; a single soft ambient shadow is reserved for offer cards that lift above the page. Modals and the search sheet use a translucent dark scrim rather than a shadow, and the immersive feed uses a solid forest backdrop instead of blur or translucency.

### Shadow Vocabulary
- **Offer card** (`shadowColor: palette.shadow`, offset `0 8`, opacity `0.18`, radius `18`): the one raised-surface shadow, paired with a 1px border.
- **Scrim** (`palette.overlay`): dims the layer behind modals, the search sheet, and the loading overlay; a depth cue, not a shadow.

### Named Rules

**The Grounded Shadow Rule.** Depth comes from one low, soft shadow (8px down, 18px blur). No layered or hard-offset shadows — borders and tonal steps do the rest.

## Shapes

Soft, generous rounding with a clear hierarchy. Full pills (`999px`) are for anything a user taps as a tag, badge, filter, or search control. Primary buttons and large panels carry `28px`; offer cards use `26px`; inputs and small actions sit at `16–18px`; vote buttons at `12px`. The immersive tab indicator is a tiny 3px bar with a `2px` radius. Cards clip their overflow so imagery respects the corner. Borders are 1px in the sand or forest family; the splash mark goes to `36px` for the brand moment.

### Named Rules

**The Pill Rule.** Tags, badges, filters, and search controls are fully rounded (`999px`); structural surfaces keep 12–28px corners. The two shape languages never mix on one element.

## Components

### Buttons
- **Shape:** 18px radius for compact actions, 28px for primary CTAs.
- **Primary:** Kiln Terracotta fill, white 16px/800 centered label, ~15px vertical padding.
- **Secondary / Ghost:** Card Cream fill, Forest Ink label, 1px sand border, 14px padding.
- **States:** Disabled is `opacity: 0.45`. No authored hover or focus treatment exists in the native implementation; when adding one, use the terracotta accent rather than a browser-default ring.

### Chips & Badges
- **Style:** Full pill, 10px horizontal / 6px vertical padding, 11px/700 label.
- **State:** Tags are bordered with ink text; badges are solid (overlay or accent) with white 11px/800 uppercase labels; selected filters take the accent.

### Cards / Containers
- **Corner Style:** 26px on offer cards, 28px on brand and form cards.
- **Background:** Card Cream on daylight, Night Card on dark.
- **Shadow Strategy:** See the Grounded Shadow Rule; one soft shadow plus a 1px border.
- **Internal Padding:** 16px on offer cards, 18–20px on form and brand cards. Offer cards lead with a 160px image or placeholder panel.

### Inputs / Fields
- **Style:** 16px radius, 1px border, 14px padding, 16px text, card-cream fill.
- **Focus:** Not yet authored in code; use a terracotta border/outline when adding it.
- **Error / Disabled:** Error copy uses Brick Danger at 14px/700; disabled controls drop to `opacity: 0.45`.

### Navigation
- **Footer:** Night-panel surface, 28px radius, 16px side margins, 10px bottom inset. Each tab is at least 68px tall with a 16px/800 glyph and a 10px/700 label; the active tab gets a Clay Deep tile and an Ember icon.
- **Immersive tabs:** 13px/700 labels with a 3px terracotta indicator; inactive labels use ink-muted. Tab labels carry a subtle text shadow to hold contrast over photography.

### Immersive Offer Feed
- **Backdrop:** Fixed Trail Forest (`#1b2f28`) behind full-bleed imagery; a gradient scrim keeps the overlay copy readable.
- **Overlay:** Business name and description in white with right-side clearance for the action rail; action glyphs at 18px with 11px/700 captions; tags and metadata as pills.
- **Brand:** The application name and logo remain present in this view.

## Do's and Don'ts

### Do:
- **Do** keep terracotta to the active path — primary actions, selected tabs, selected chips, the tab indicator.
- **Do** set names and headlines in Georgia at 700; keep body, metadata, and controls on the system sans.
- **Do** keep the bottom navigation night-dark in both themes, with the terracotta family only on its active tile.
- **Do** use `999px` pills for tags, badges, filters, and search controls, with 16–28px corners on structural surfaces.
- **Do** use one soft card shadow (`0 8 18`) plus a 1px hairline; keep controls at least 44pt tall (footer tabs are 68px).
- **Do** test both palettes — the daylight paper scheme and the forest-night scheme — on every new surface.

### Don't:
- **Don't** set body copy or metadata in Georgia; it is for landmarks only.
- **Don't** invent a third accent color. Sage is secondary, clay is tertiary, and success/danger are status-only.
- **Don't** stack shadows or use hard-offset shadows; the system is flat at rest with one ambient lift.
- **Don't** add a hover-only affordance or a wide desktop reflow — native touch is the primary target and both platforms share the phone-first composition.
- **Don't** hardcode a new surface color when a palette role already exists; the hardcoded footer is the one deliberate exception.
