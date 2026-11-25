---
name: DealsSeeker
description: Hyperlocal deal discovery and community upkeep in one warm, wayfinding-led design language.
colors:
  warm-paper: "#faf8f5"
  paper-raised: "#f1ede7"
  cream-panel: "#ffffff"
  sage-panel: "#e7f7f1"
  card-cream: "#ffffff"
  sand-border: "#8b857e"
  plum-ink: "#18181b"
  slate-ink: "#52525b"
  tangerine: "#ce4719"
  tangerine-display: "#d94e1f"
  tangerine-mute: "#fbe6df"
  accent-text: "#b83b12"
  on-accent: "#ffffff"
  on-danger: "#ffffff"
  field-success: "#0d7a5f"
  brick-danger: "#b42318"
  mint-badge: "#0d7a5f"
  highlight-ink: "#ffffff"
  soft-shadow: "rgba(24, 24, 27, 0.16)"
  day-scrim: "rgba(9, 9, 11, 0.52)"
  night-paper: "#121417"
  night-raised: "#191c21"
  night-panel: "#1e2228"
  night-sage: "#17332a"
  night-card: "#1e2228"
  night-border: "#71717a"
  dawn-ink: "#f4f4f6"
  mist-ink: "#a1a1aa"
  coral-peach: "#ff8a65"
  coral-deep: "#5a2e20"
  mint-success: "#4ade80"
  rose-danger: "#f87171"
  night-shadow: "rgba(0, 0, 0, 0.3)"
  night-scrim: "rgba(0, 0, 0, 0.66)"
  fixed-backdrop: "#121417"
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
    backgroundColor: "{colors.tangerine}"
    textColor: "#ffffff"
    rounded: "{rounded.2xl}"
    padding: "15px 20px"
  button-ghost:
    backgroundColor: "{colors.card-cream}"
    textColor: "{colors.plum-ink}"
    rounded: "{rounded.md}"
    padding: "14px"
  offer-card:
    backgroundColor: "{colors.card-cream}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.card-cream}"
    textColor: "{colors.plum-ink}"
    rounded: "{rounded.md}"
    padding: "14px"
  chip:
    backgroundColor: "{colors.sage-panel}"
    textColor: "{colors.plum-ink}"
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

DealsSeeker reads like a friendly deals counter: warm alabaster ground, near-black ink, a vibrant tangerine mark for the path you are on, and mint for verified savings. The palette is deliberately cheerful rather than corporate; discovery feels like browsing a welcoming stall, not scanning a marketplace. The one accent is sparse on purpose — its rarity is what makes an active tab, a primary button, and a selected filter legible at a glance.

The typography follows the same cartographer's logic. Georgia acts as the landmark: it appears on the product name, screen titles, offer names, and the rare brand moment, never on the operational text that does the work. Everything else — descriptions, distances, tags, buttons, micro-labels — stays on the system sans, tight and unpretentious. Surfaces are generously rounded but never soft enough to lose structure; a single low shadow lifts offer cards off the page, and everything else is held in place by 1px borders and tonal steps.

The system ships one mobile-native language to iOS and Android from a single codebase. Two complete palettes cover light and dark: Clean Warm Light (alabaster, tangerine, mint) and Cozy High-Contrast Dark (deep slate, coral-peach, bright mint). The immersive photo feed is the deliberate exception — it is always laid on a fixed deep-slate backdrop (`#121417`), with the app name and logo present, so the imagery carries the moment and the interface recedes. The authored logo set supplies symbol, horizontal, stacked, wordmark, inverse, mono and reversed variants; the wordmark is set in Georgia and the mark is a rounded square.

**Key Characteristics:**
- Warm alabaster and near-black ink carry the structure; tangerine is the only wayfinding accent.
- Georgia for landmarks, system sans for everything operational.
- Generous 16–28px radii; chips, badges, and filters are full pills.
- One soft ambient shadow on raised cards; 1px borders and tonal shifts do the rest.
- Three selectable palette worlds, each with a light and dark variant: Golden Hour/Lantern (warm paper and terracotta), Sunshine Market/Night Market (amber and plum), and Tangerine & Mint/Cozy Dark (alabaster and coral). The bottom navigation keeps a dark surface in every world.
- Compact 700–800 weight micro-labels with wide tracking for metadata and actions.

## Colors

A deals-counter palette: alabaster and white panels under near-black type, with one tangerine waypoint accent and a parallel deep-slate set for dark mode.

### Primary
- **Tangerine** (`#ce4719` / dark `#ff8a65`): The waypoint. Primary button fills, the active navigation tile's icon, the immersive tab indicator, and selected states. It marks the path — never the background. Light fills use white text (4.63:1); dark fills use deep-slate text (7.97:1).
- **Tangerine Display** (`#d94e1f`): Large brand lettering and marks only; not for normal-size text on white.
- **Accent Text** (`#b83b12` / dark `#ff8a65`): The accent used as small text or a 1px boundary on neutral surfaces, where the fill color would not hold contrast.

### Secondary
- **Mint Panel** (`#e7f7f1` / dark `#17332a`): A soft mint tint for alternate panels and chip surfaces, giving status and grouping a place outside the accent.

### Tertiary
- **Tangerine Mute** (`#fbe6df` / dark `#5a2e20`): A muted tangerine family used for accent-muted fills — the active navigation tile's base and soft accent details.
- **Mint Badge** (`#0d7a5f` / dark `#4ade80`): A reserved savings and promoted signal, always with a text label and paired with white text in light and deep-slate text in dark. It is not a wayfinding accent.

### Neutral
- **Warm Paper** (`#faf8f5`): The daylight app background — warm alabaster, never pure white.
- **Paper Raised** (`#f1ede7`): A one-step deeper surface for raised daylight regions.
- **Cream Panel** (`#ffffff`) and **Card Cream** (`#ffffff`): Panels and cards with a subtle `#e6e2dc` decorative border.
- **Ink** (`#18181b` / dark `#f4f4f6`): Primary text. Dark mode avoids pure black to reduce haloing for astigmatism.
- **Secondary Ink** (`#52525b` / dark `#a1a1aa`): Secondary text and inactive navigation labels.
- **Sand Border** (`#8b857e` / dark `#71717a`): The 1px boundary that defines panels and inputs without shadow, held at 3:1 or better.
- **Field Success** (`#0d7a5f` / dark `#4ade80`) and **Brick Danger** (`#b42318` / dark `#f87171`): Status only. Danger fills use white text in light and deep-slate text in dark.
- **Night Paper** (`#121417`), **Night Panel** (`#1e2228`), **Night Card** (`#1e2228`): The deep-slate night surfaces.
- **Fixed Backdrop** (`#121417`): The fixed deep-slate backdrop behind the immersive offer feed, independent of the active theme.

### Named Rules

**The Waypoint Rule.** Tangerine marks the path: primary actions, selected tabs, selected chips, the active indicator. It stays on a small fraction of any screen; alabaster and near-black carry the rest.

**The Night Footer Rule.** The bottom navigation is always the fixed deep-slate surface (`#1e2228` with a `#71717a` hairline), in light and dark themes alike. Only its active tile adopts the tangerine family (`#5a2e20` fill, `#ff8a65` icon).

**The Status-Text Rule.** Mint savings and coral alert colors are never used alone. Every status badge carries a text label; an icon accompanies it where one exists.

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

A restrained hybrid. Panels are flat and bounded by 1px hairlines; a single soft ambient shadow is reserved for offer cards that lift above the page. Modals and the search sheet use a translucent dark scrim rather than a shadow, and the immersive feed uses a solid deep-slate backdrop instead of blur or translucency.

### Shadow Vocabulary
- **Offer card** (`shadowColor: palette.shadow`, offset `0 8`, opacity `0.18`, radius `18`): the one raised-surface shadow, paired with a 1px border.
- **Scrim** (`palette.overlay`): dims the layer behind modals, the search sheet, and the loading overlay; a depth cue, not a shadow.

### Named Rules

**The Grounded Shadow Rule.** Depth comes from one low, soft shadow (8px down, 18px blur). No layered or hard-offset shadows — borders and tonal steps do the rest.

## Shapes

Soft, generous rounding with a clear hierarchy. Full pills (`999px`) are for anything a user taps as a tag, badge, filter, or search control. Primary buttons and large panels carry `28px`; offer cards use `26px`; inputs and small actions sit at `16–18px`; vote buttons at `12px`. The immersive tab indicator is a tiny 3px bar with a `2px` radius. Cards clip their overflow so imagery respects the corner. Borders are 1px in the sand or slate family; the splash mark goes to `36px` for the brand moment.

### Named Rules

**The Pill Rule.** Tags, badges, filters, and search controls are fully rounded (`999px`); structural surfaces keep 12–28px corners. The two shape languages never mix on one element.

## Components

### Buttons
- **Shape:** 18px radius for compact actions, 28px for primary CTAs.
- **Primary:** Kiln Terracotta fill, white 16px/800 centered label, ~15px vertical padding.
- **Secondary / Ghost:** Card Cream fill, Forest Ink label, 1px sand border, 14px padding.
- **States:** Disabled is `opacity: 0.45`. No authored hover or focus treatment exists in the native implementation; when adding one, use the tangerine accent rather than a browser-default ring.

### Chips & Badges
- **Style:** Full pill, 10px horizontal / 6px vertical padding, 11px/700 label.
- **State:** Tags are bordered with ink text; badges are solid (overlay, accent or the reserved highlight) with 11px/800 uppercase labels in the matching on-color; selected filters take the accent.

### Cards / Containers
- **Corner Style:** 26px on offer cards, 28px on brand and form cards.
- **Background:** Card Cream on daylight, Night Card on dark.
- **Shadow Strategy:** See the Grounded Shadow Rule; one soft shadow plus a 1px border.
- **Internal Padding:** 16px on offer cards, 18–20px on form and brand cards. Offer cards lead with a 160px image or placeholder panel.

### Inputs / Fields
- **Style:** 16px radius, 1px border, 14px padding, 16px text, card-cream fill.
- **Focus:** Not yet authored in code; use a tangerine border/outline when adding it.
- **Error / Disabled:** Error copy uses Brick Danger at 14px/700; disabled controls drop to `opacity: 0.45`.

### Navigation
- **Footer:** Night-panel surface, 28px radius, 16px side margins, 10px bottom inset. Each tab is at least 68px tall with a 16px/800 glyph and a 10px/700 label; the active tab gets a Clay Deep tile and an Ember icon.
- **Immersive tabs:** 13px/700 labels with a 3px tangerine indicator; inactive labels use ink-muted. Tab labels carry a subtle text shadow to hold contrast over photography.

### Immersive Offer Feed
- **Backdrop:** Fixed deep slate (`#121417`) behind full-bleed imagery; a gradient scrim keeps the overlay copy readable.
- **Overlay:** Business name and description in white with right-side clearance for the action rail; action glyphs at 18px with 11px/700 captions; tags and metadata as pills.
- **Brand:** The application name and logo remain present in this view.

## Do's and Don'ts

### Do:
- **Do** keep tangerine to the active path — primary actions, selected tabs, selected chips, the tab indicator.
- **Do** set names and headlines in Georgia at 700; keep body, metadata, and controls on the system sans.
- **Do** keep the bottom navigation deep slate in both themes, with the tangerine family only on its active tile.
- **Do** use `999px` pills for tags, badges, filters, and search controls, with 16–28px corners on structural surfaces.
- **Do** use one soft card shadow (`0 8 18`) plus a 1px hairline; keep controls at least 44pt tall (footer tabs are 68px).
- **Do** test both palettes — Clean Warm Light and Cozy High-Contrast Dark — on every new surface.

### Don't:
- **Don't** set body copy or metadata in Georgia; it is for landmarks only.
- **Don't** add a second wayfinding accent. Mint is savings, tangerine-mute is tertiary, success/danger are status-only, and status is never color-alone.
- **Don't** stack shadows or use hard-offset shadows; the system is flat at rest with one ambient lift.
- **Don't** add a hover-only affordance or a wide desktop reflow — native touch is the primary target and both platforms share the phone-first composition.
- **Don't** hardcode a new surface color when a palette role already exists; the hardcoded footer is the one deliberate exception.
