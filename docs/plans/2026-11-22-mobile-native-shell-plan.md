# Mobile-native shell & navigation plan

- **Date**: 2026-11-22
- **Status**: **Phases 2 and 3 CLOSED** (2026-11-24). P2 exit gates: BDD for `APP.SHELL.002/003/004` pass ✅; unit/integration coverage **81.95% statements / 81.74% lines** ✅; typecheck + arch clean ✅; device verification completed on Android via direct device tools (Maestro E2E still blocked by driver timeout, emulator reboot declined) ✅. P3 delivered: `DESIGN.md` verified and drift corrected (shadow `0.18`, mobile-only wording); Night Footer Rule unit-locked; native critique 27/40 → 27/40 archived; critique-driven fixes for single-line footer labels and FAB clearance with RED→GREEN and device re-verification at font_scale 1.3. Evidence: `.impeccable/tdd/p3-design-hardening.tdd.md`. **Waivers**: iOS simulator/visual parity (requires macOS/Xcode — unavailable); TalkBack/VoiceOver on iOS; landscape (app is portrait-locked by `app.json`). Remaining open items are outside P2/P3: the two tracked E2E gaps (`offers-comment`, `add-offer-submit`), branch coverage 73.98%, and Maestro driver instability.
- **Inputs**: the hybrid-navigation analysis, the mobile-only and hybrid-conformity clarifications, the Impeccable context (`PRODUCT.md`, `DESIGN.md`, native refs), the design-pattern-review lens, and the device-test evidence from `test/e2e/MOBILE_DEVICE_TEST_PLAN.md`.
- **Rule**: this repo is spec-first. No production change in §8–§10 starts before the specs in §7 are Approved.

## 1. Objective

Adopt native **OS behavior** (navigation stack, gestures, system Back, modal presentation, insets, lifecycle, accessibility behavior) while keeping DealsSeeker's **brand UI/UX identical on both platforms** — no explicit HIG/M3 visual adaptation. Do not regress the behaviors already verified on device: 10-tag cap, Add Offer cancel/discard, immersive-feed Back, keyboard access, offline Retry, immediate avatar update.

## 2. Evidence base

### 2.1 Product and design truth (loaded from Impeccable context)

- `PRODUCT.md` records platform `adaptive`: *"Mobile-native first: iOS and Android are the primary targets; the web client is secondary."* The user has chosen **mobile-only**, so Phase 1 updates this document and `AGENTS.md`.
- `DESIGN.md` is the authoritative visual system and stays so: Night Footer Rule (`#22332f` / `#476258` hairline, both themes), Waypoint Rule (terracotta = active path only), Landmark Rule (Georgia for names/headlines only), Pill Rule (`999px` tags/filters), one soft shadow, 44pt control minimum, phone-first composition.
- The native platform references are used for **behavior only** (§3), never as a visual brief.

### 2.2 Rubric-based estimate of the current shell (feeding this plan, not a formal critique run)

Mode: Operate. All 10 heuristics apply. Scored against *brand* consistency plus *system behavior* — not against platform visual style.

| # | Heuristic | Est. | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Footer selected state works; no navigation hierarchy/back-stack indicator |
| 2 | Match system / real world | 2 | Behavioural only: custom global nav breaks system Back / edge-swipe expectations |
| 3 | User control and freedom | 2 | Cancel/discard added, but no back stack between tabs or overlay layers |
| 4 | Consistency and standards | 3 | Brand system is internally consistent; platform visual standards are intentionally out of scope |
| 5 | Error prevention | 3 | Discard confirmation, tag cap, bounded inputs present |
| 6 | Recognition rather than recall | 2 | Footer labels exist; nav glyphs are Unicode placeholders |
| 7 | Flexibility and efficiency | 2 | Tabs + FAB; no accelerators, one rigid path |
| 8 | Aesthetic and minimalist design | 3 | Restrained, authored, on-brand |
| 9 | Error recovery | 3 | Recoverable load/save/search states verified on device |
| 10 | Help and documentation | 2 | "Help" entry exists, minimal contextual help |
| | **Total** | **~25/40 — Acceptable** | Weak scores cluster around *navigation behavior*, not visual style |

The migration is justified by system-behavior conformance (Back, gestures, modals, insets), not by restyling. A formal persisted `/impeccable critique` can replace this estimate in §7.

### 2.3 Code facts

- `package.json` has **no** React Navigation / expo-router / react-native-screens dependency. Navigation is hand-built: `activeTab` in `src/context/AppContext.tsx`, footer in `src/components/AppFooterBar.tsx` (68px tabs, 11px labels), `overlayRoute` + `immersiveOffers` in `App.tsx`, custom `BackHandler` logic.
- `src/components/StandardHeader.tsx` is the branded header inside each screen's scroll content (Georgia 28, brand palette). It stays.
- Web-specific branches exist in `storage.ts` (3), `MapPreview.tsx` (3), `AddOfferScreen.tsx`, `ImmersiveOfferFeed.tsx`, `useOfferImageUri.ts`, `decorativeProps.ts`, plus `src/stubs/ReactDevToolsSettingsManager.js` and the `postinstall` script in `package.json`.
- `MapPreview` is WebView + HTML for both GoogleMaps and OpenLayers.
- Device evidence: offline Retry, keyboard-open submit, dark theme, large text (font_scale 1.3) all PASS; landscape could not be rendered by this AVD (settings restored).

## 3. Hybrid conformity policy

**Rule: the OS owns behavior; the brand owns appearance.**

| adapts per OS (yes) | stays brand-defined and identical (no platform restyle) |
|---|---|
| System Back button and predictive Back gesture | Header, titles, typography and Georgia landmarks |
| iOS left-edge swipe back | Night footer tab bar, terracotta active path, pill shapes |
| Native push/pop and modal transition *behavior* (incl. iOS sheet dismissal) | Buttons, cards, inputs, chips, dialogs, feedback components |
| Safe-area / window insets (notch, Dynamic Island, cutout, gesture bars, IME) | Icon set, icon stroke and glyph style |
| Keyboard avoidance behavior per OS (`padding` iOS / `height` Android) | Palette, spacing, radius, single soft shadow |
| Modal presentation semantics (sheet vs full-screen) | Screen composition, copy, empty/error states |
| Runtime permissions, lifecycle, orientation, background/foreground | Content layout (phone-first, tablet two-column in Add Offer) |
| Reduce Motion / Remove animations behavior (cross-platform API) | Touch-target minimum from `DESIGN.md` (44pt; footer 68px) |
| Screen-reader semantics and focus/announcement behavior | — |

Deliberately **not adopted**: SF Symbols / Material icon sets, Material type scale and color roles, Material You dynamic color, tonal elevation, navigation rail/drawer on tablets, platform-native tab-bar/header visuals, platform dialog/action-sheet *visuals*, and `expo-router/unstable-native-tabs`.

Accessibility sizing (font scale, screen readers, touch targets) is verified as *behavior*, not as a visual redesign.

## 4. Decisions (resolved 2026-11-22)

### Gate A — Web scope → **Mobile-only**

Phase 1 (§8) is in scope: delete the web client, E2E path and platform branches; update `PRODUCT.md`, `AGENTS.md` and specs. Native behavior can be adopted without a web-parity layer or expo-router.

### Gate B — Header ownership → **Brand header, native navigation behavior** *(supersedes the earlier "native bar + branded title" choice)*

- Native stack/tab primitives run underneath, but their default platform chrome is hidden (`headerShown: false`).
- `StandardHeader` remains the only header, unchanged, on every standard screen.
- Back navigation, gestures and modal dismissal come from native navigation behavior, not from a custom global navigator.
- This keeps the UI visually identical on iOS and Android while honoring OS interaction rules.

### Gate C — Iconography → **One brand icon set on both platforms** *(supersedes the earlier "native icons for chrome" choice)*

Keep the existing brand glyphs / a single stroke-consistent set (Lucide) everywhere. No SF Symbols or Material icons, because that is a visual platform adaptation the user explicitly does not want.

### Decision-table rows to add to `specs/decisions/DECISION_TABLES.md`

| Decision Point | Default Rule | Notes |
|---|---|---|
| Navigation container | Native stack + tab navigator for behavior; all platform chrome hidden | No custom global navigator |
| Header ownership | Branded `StandardHeader` only; `headerShown: false` on native stack | One header, identical on both OSes |
| Visual system | `DESIGN.md` is authoritative; no HIG/M3 visual adaptation | Brand UI identical across platforms |
| Modal presentation | Native modal behavior; brand-styled content | iOS sheet semantics, Android full-screen; cancel/discard preserved |
| System Back | Native back listeners replace custom BackHandler | Immersive close and Add Offer discard preserved |
| Platform scope | Mobile-only (iOS + Android) | Web client, E2E and branches removed in Phase 1 |
| Accessibility | Behavior verified (font scale, screen reader, 44pt targets) | No platform-specific visual restyle |

## 5. Phase map

| Phase | Work | Status |
|---|---|---|
| 0 | Evidence & specs | Complete |
| 1 | Mobile-only cleanup | Complete |
| 2 | Native navigation behavior | Complete (code level) |
| 3 | Design-system hardening | In progress |
| 4 | Optional OS capabilities | Each needs its own spec |

## 6. Scope guard

Before any Phase 2–3 edit, check against §3:

- **In scope**: anything that changes how the app responds to OS Back/gestures, insets, keyboard, permissions, lifecycle, modal semantics, animations setting, or screen readers.
- **Out of scope**: any change to colors, typography, icon style, component shapes, spacing or layout made *to look more iOS/Material*. Those need a separate brand/spec decision.

## 7. Phase 0 — Evidence and specs (no production code)

1. Run a formal persisted `/impeccable critique` on `App.tsx` (native: Assessment A only) to replace the §2.2 estimate; interpret scores against brand + behavior, not platform visuals.
2. Run `/impeccable audit` and `/impeccable adapt` with the native references on `OffersScreen.tsx` and `AppFooterBar.tsx`, filtering findings through §3 (behavior findings in scope; platform-visual findings out of scope).
3. Record §4 decisions in `specs/decisions/DECISION_TABLES.md`.
4. Add specs (next free IDs in `specs/features/application-shell/`):
   - `APP.SHELL.002` — native navigation behavior and tab destinations; brand chrome unchanged.
   - `APP.SHELL.003` — native modal behavior for Add Offer / favorites, including cancel/discard.
   - `APP.SHELL.004` — system Back semantics (immersive feed close, Add Offer cancel, tab back).
5. Add matching Gherkin scenarios in `specs/bdd/`, bidirectional `Related Specs`, traceability rows, and mark **Approved** only after validation.

**Exit**: spec IDs registered in `specs/traceability/TRACEABILITY.md`; every ID has BDD; no Draft specs; decisions recorded.

### Phase 0 results (2026-11-22)

- Formal critique of `App.tsx`: **25/40** → `.impeccable/critique/2026-11-22T17-47-08Z__src-dealsseeker-reactnative-app-tsx.md`. P0 hand-rolled navigation; P1 overlays not modal; P1 no hierarchy cue (keep R29 per user); P2 ad-hoc insets.
- Native audit: **13/20** → `.impeccable/audit/2026-11-22T17-49-17Z__src-dealsseeker-reactnative-app-tsx.md`. 0 P0 / 3 P1 / 2 P2.
- Native adapt: phone→tablet already restructures Add Offer; platform→platform translates behavior only; landscape to be verified with Maestro `setOrientation`.
- User decisions from critique: Phase 2 covers P0 + P1 modal first; keep `APP.SHELL.001-R29`; keep brand glyphs unchanged.
- `APP.SHELL.002/003/004` Approved with BDD in `specs/bdd/app-shell-native-behavior.feature`, traceability rows, decision-table rows and bidirectional links.
- Verification: 51 suites / 302 tests pass; typecheck clean.

## 8. Phase 1 — Mobile-only cleanup (complete)

The Maestro suite lives in `test/e2e/device/` with 13 flows (`npm run test:e2e:device`), plus an `accessibilityLabel` on the Offers search input. Maestro 2.12.1 was installed and the suite executed: **12/13 flows pass**. Two scenarios remain as tracked test gaps (the emulator never renders offer cards for `offers-comment.yaml`, and HTTP fault injection for failed search has no device equivalent); they are no longer a release block per user decision.

Phase 1 is pure deletion, aligned with the `ponytail` guardrail:

- Remove `react-native-web`, `react-native-web` postinstall stub, the Playwright web E2E suite and config; `npm run test:e2e` now runs the Maestro device suite.
- Collapse the `Platform.OS === 'web'` branches listed in §2.3; simplify `AddOfferScreen` columns to `resolveAddOfferColumns(width)` (tablet two-column stays native).
- Update `PRODUCT.md` platform, `AGENTS.md`, `README.md` and web-specific verification instructions to mobile-only.
- Consider `react-native-maps` instead of the WebView map **only** with a new spec — it is a capability change, not cleanup.

### Phase 1 results

Deleted `react-native-web` and `@playwright/test` (lockfile regenerated), the `postinstall` stub and `src/stubs/`, the `web` and web-E2E scripts and `playwright.config.ts`, the five Playwright specs/helpers and `serve-web.cjs`. Removed every `Platform.OS === 'web'` branch from `storage.ts`, `decorativeProps.ts`, `useOfferImageUri.ts`, `AddOfferScreen.tsx`, `ImmersiveOfferFeed.tsx` and `MapPreview.tsx`. Updated `PRODUCT.md`, `AGENTS.md`, `README.md` and `UIUX_IMPROVEMENT_PLAN.md`; unit tests for native storage and tablet columns rewritten. `npm run test:e2e` now runs the Maestro device suite (`test:e2e:device` kept as an alias). `react-native-webview` stays — the map uses it on native.

**Exit**: 51 suites / 302 tests pass; typecheck clean; `test:arch` clean (52 files, 64 modules, 213 dependencies).

## 9. Phase 2 — Native navigation behavior

1. Install only the needed dependencies: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-gesture-handler`. Do **not** add zeego, bottom-sheet, datetimepicker, haptics or a new icon set. Avoid `expo-router/unstable-native-tabs` (unstable, and visually platform-native).
2. Map the current shell:
   - `activeTab` destinations → tab navigator; the tab bar stays the brand night footer (custom `tabBar`), not the platform tab-bar visual. "Create" remains the single FAB; Help stays a header action; Feed/Map remain segments inside Offers.
   - `overlayRoute: 'add-offer'` → native modal behavior (iOS sheet semantics, Android full-screen), brand-styled content, cancel/discard preserved.
   - `favorites` → stack screen; `immersiveOffers` → full-screen stack screen with `headerShown: false`.
   - Native stack everywhere with `headerShown: false`, so `StandardHeader` stays the only visible header.
3. Replace custom `BackHandler` code with navigation lifecycle listeners; preserve discard confirmation and immersive close exactly as specified.
4. Handle platform behavior differences explicitly: iOS edge-swipe vs Android predictive Back, safe-area/window insets, IME insets, modal dismissal, Reduce Motion / Remove animations, lifecycle, permissions, screen-reader focus.
5. Keep all content screens, palettes, components and `DESIGN.md` tokens unchanged.

**Exit**: BDD scenarios for `APP.SHELL.002/003/004` pass; unit/integration tests ≥80%; typecheck and arch checks clean; device verification on Android emulator plus iOS simulator where available.

## 10. Phase 3 — Design-system hardening

- `/impeccable document` to confirm `DESIGN.md` matches shipped code; `/impeccable extract` to pull tokens into `theme/` and shared UI into `components/ui/` only where duplication is real.
- Accessibility behavior checks: font_scale 1.3, dark theme on both palettes, ≥44pt targets, TalkBack/VoiceOver, Reduce Motion, and **landscape on a device that actually rotates** (the current AVD cannot).
- Visual parity check: identical brand UI on iOS and Android screenshots — any platform-visual drift is a defect under §3.
- Then `/impeccable polish` and a re-run of `/impeccable critique` to confirm the score improves.

## 11. Phase 4 — Optional, spec-gated only

Haptics, bottom sheets, date/time pickers, contextual menus, native map. Each requires its own spec + BDD and a dependency justification. Analyze them as OS behavior only; any visual change still needs a brand decision.

## 12. Verification checklist

- [ ] TDD RED→GREEN for every changed behavior; ≥80% coverage; full suite + typecheck + arch tests.
- [ ] `/impeccable audit` native + `/impeccable adapt` native, with platform-visual findings filtered out per §3.
- [ ] Device scenarios: Back (Add Offer discard, immersive close), tab switching, modal dismissal, keyboard-open submit, offline Retry, permissions, background/foreground.
- [ ] Screenshots from emulator/simulator (not browser): phone + tablet if shipped; dark theme and font_scale 1.3; note hardware vs emulator for gesture/performance evidence.
- [ ] Visual parity: brand UI identical across iOS and Android.
- [ ] TalkBack / VoiceOver pass (still an open gap from the last cycle).
- [ ] `git diff` reviewed with `ponytail-review` before merge.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Native platform chrome leaks into the UI | `headerShown: false`, custom branded `tabBar`, visual-parity check in §10 |
| Double header / duplicated back affordance | Branded `StandardHeader` only; native back behavior underneath |
| Back-stack regression | Spec `APP.SHELL.004` + device tests before merge |
| iOS edge-swipe conflicts with carousel/map/feed | Gesture negotiation in Phase 2 BDD; device check |
| Two FABs or FAB vs tab-bar collision | Keep exactly one FAB; brand night footer |
| Dependency creep | Install only §9.1 list; everything else spec-gated |
| Loss of web E2E coverage | Maestro suite in `test/e2e/device/` covers 12/14 scenarios; the two gaps are tracked and no longer block release |
| Accessibility findings used as a trojan horse for visual restyle | §3 policy + §12 visual-parity check |

## 14. Immediate next action

Phase 2: implement the native navigation behavior specified by `APP.SHELL.002/003/004` — native stack + tabs beneath the brand chrome, native modal behavior for Add Offer, native Back listeners replacing `BackHandler` — then re-run the Maestro suite and device verification.
