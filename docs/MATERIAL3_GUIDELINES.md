# Material 3 guidelines — Android phase reference

Source: https://m3.material.io/ (read 2026-11-27). The site is JavaScript-rendered; content was read from the rendered pages, not raw HTTP. Scope: the Android-only phase recorded in `PRODUCT.md`.

## Foundations
- Foundations cover accessibility, content design, customization, design tokens, interaction states and layout.
- Accessibility is "by default": anticipate varied abilities, honor individual customization, learn before building, treat WCAG requirements as a starting point rather than a ceiling.
- Design tokens keep style values consistent across design, code, tools and platforms.

## Color
- 26+ semantic roles mapped to components; built-in dark theme; static baseline scheme plus optional dynamic color from wallpaper or in-app content.
- Three contrast levels (standard, medium, high) are tokenized so users can choose.
- Surfaces are tone-based, not tied to elevation; fixed colors exist for primary/secondary/tertiary accent groups; semantic colors can be excluded from dynamic color.
- Palette math uses HCT (hue, chroma, tone); one source color generates five key colors and tonal palettes.

## Typography
- One type scale: 15 baseline + 15 emphasized styles, from Display Large to Label Small.
- Roles: display, headline, title, body, label. Emphasized styles are for selection, actions, headlines and other editorial emphasis; components do not use them by default.
- Brand typeface for large styles (expression); plain typeface for body/label (readability). Roboto is the default for both. Variable fonts (Roboto Flex) give more control.
- Line height can adapt to language script height; type styles are tokenized.

## Shape
- 35-shape library; corner-radius scale with new tokens (large increased 20dp, extra large increased 32dp, extra extra large increased 48dp).
- Rectangles are fully rounded by default; "fully rounded" means `full`, not 50% of the component size.
- Shape morph communicates interaction states, in-progress actions and environmental change. Use abstract shapes sparingly; don't assign fixed semantics to a shape.

## Motion
- Physics-based spring system (stiffness, damping, initial velocity) replaces the older easing/duration system.
- Two presets: expressive (overshoot/bounce) and standard (minimal bounce). Most of a product uses one scheme.
- Tokens: spatial (overshoots, for position/rotation/size/corners) and effects (no overshoot, for color/opacity), each at fast/default/slow speeds. Token values adapt to device class (wearable/phone/tablet).
- Honor the system "Remove animations" setting.

## Components (relevant to DealsSeeker)
- Navigation bar: compact/medium windows, 3–5 equal-importance destinations, consistent across screens, no drop shadow, active indicator (pill/filled icon). Navigation rail for mid-sized, drawer for larger windows.
- Bottom sheets: compact/medium breakpoints; standard and modal variants; secondary content only; dismissible to return to main content; 28dp top corners, max-width 640dp, drag handle with 48dp accessible target.
- Snackbars: non-interrupting, bottom of UI; may be temporary (dismissive) or persist until acted on (non-dismissive) — the latter matches our explicit Done/Undo status surface.
- App bars: describe the current page with 1–2 essential actions; small, medium flexible, large flexible and search variants; on scroll use a color fill rather than a drop shadow; toolbars hold page actions.

## Fit with the current app
- Platform: Android-only phase; iOS is explicitly out of scope.
- Our native tab bar, bottom sheets, app bar, Material symbol vocabulary and predictive Back align.
- Our status surface is a non-dismissive snackbar (explicit Done/Undo), which M3 permits.
- Our landmark/body font split follows M3's brand-face/plain-face guidance; Android renders a generic serif because Georgia is not bundled (see the typography note in chat).
- Not yet adopted from M3: spring-based motion tokens, dynamic color from wallpaper/content, and shape morph. These are design-system decisions requiring spec changes, not defects.
