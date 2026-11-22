# TDD Evidence — Offers discovery recovery states

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md`
- Specs: `specs/features/offers-view/OFFERS.UX.001.md`, `specs/features/application-shell/APP.RESILIENCE.UX.001.md` (both Approved)
- BDD: `specs/bdd/offers-ux.feature`, `specs/bdd/app-resilience-ux.feature`
- Driver: `/impeccable critique` (21/40, two P1 findings) + `/impeccable audit` (13/20)

## User journeys
1. As a deal hunter, I want an empty result to explain itself and offer a next step so that I never hit a dead end.
2. As a user on a real mobile connection, I want a failed search to be visible and retryable where I am working so that I am never stranded by a failed request.

## RED / GREEN / REFACTOR evidence

| Stage | Command | Result |
|---|---|---|
| RED (state resolver) | `npm test -- offersState.test.ts` | FAIL — `Cannot find module .../offersState` (compile-time RED, missing implementation) |
| GREEN (state resolver) | `npm test -- offersState.test.ts` | PASS — 6 tests |
| RED (panel) | `npm test -- offersStatePanel.test.tsx` | FAIL — `Cannot find module .../OffersStatePanel` |
| GREEN (panel) | `npm test -- offersStatePanel.test.tsx` | PASS — 4 tests |
| RED (wiring) | `npm test -- offersDiscoveryStates.test.tsx` | FAIL — 3 tests: no `offers.retry`, `offers.clearFilters`, or `offers.createFirstOffer` button rendered |
| GREEN (wiring) | `npm test -- offersDiscoveryStates.test.tsx` | PASS — 3 tests |
| REFACTOR | `npm test` | PASS — 102/102 after consolidating three repeated JSX blocks into one local factory and removing the duplicated immersive empty text |
| Verification | `npm run test:coverage` | 102/102; new modules 100% coverage; `OffersScreen.tsx` 57.6% |
| Typecheck | `npx tsc --noEmit -p tsconfig.check.json` (excludes pre-existing untracked `playwright.config.ts`) | clean |

## Test specification

| # | Guarantee | Test | Type | Result |
|---|---|---|---|---|
| 1 | Offers present → no state panel | `offersState.test.ts: reports no state when offers are available` | unit | PASS |
| 2 | Search failure outranks empty results | `offersState.test.ts: prioritizes the search error over the empty state` | unit | PASS |
| 3 | No offers + active filter → filtered no-results | `offersState.test.ts: reports a filtered no-results state for query/favorites-only` | unit | PASS |
| 4 | No offers + no filter → empty state | `offersState.test.ts: reports the empty state when no offers and no filters are present` | unit | PASS |
| 5 | Panel shows message and hint | `offersStatePanel.test.tsx: renders the message and its supporting hint` | component | PASS |
| 6 | Recovery action is pressable and labelled | `offersStatePanel.test.tsx: calls the recovery action when the action is pressed` | component | PASS |
| 7 | No action rendered when none provided | `offersStatePanel.test.tsx: omits the action when no recovery action is provided` | component | PASS |
| 8 | Failed search shows retryable error | `offersDiscoveryStates.test.tsx: shows a retryable search error when the request fails` | integration | PASS |
| 9 | Retry re-runs search and clears error | same test (second call + error cleared) | integration | PASS |
| 10 | Filtered empty state offers clear-filters and re-searches with current radius | `offersDiscoveryStates.test.tsx: offers to clear filters when a query returns no results` | integration | PASS |
| 11 | Globally empty state opens Add Offer | `offersDiscoveryStates.test.tsx: offers to create the first offer when no offers exist` | integration | PASS |

## Critique trend
`21/40` → `27/40` (first two P1 findings resolved; P2 mode-toggle and touch-target issues remain open in `UIUX_IMPROVEMENT_PLAN.md` §3/§4).

## Known gaps
- Native visual verification (simulator/emulator/hardware, both palettes, phone + tablet, both orientations, large text) was not possible in this environment; source-level craft-floor checks and Jest component tests were used instead. This is required before shipping per the platform reference.
- Global coverage is 24.76% because most pre-existing components have no tests; this change did not lower it and brought the two new modules to 100% and `OffersScreen.tsx` to 57.6%.
- `npm run typecheck` fails only on the pre-existing untracked `playwright.config.ts` (missing `@types/node`); the app source typechecks cleanly.
- Remaining P2/P3 findings are intentionally out of scope for this slice.

## Follow-up cycle — accessible control sizes (`APP.ACCESSIBILITY.UX.001`)

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- controlSizes.test.tsx` | 4 failures: footer gap 4 (<8), footer label 10 (<11), chip missing 44-unit floor, immersive search button 40 (<44) |
| GREEN | `npm test -- controlSizes.test.tsx` | PASS — 5 tests |
| Verification | `npm test` | 15 suites, 107/107 |
| Typecheck | `npx tsc --noEmit -p tsconfig.check.json` | clean |

Guarantees: footer tabs ≥44 units with ≥8-unit separation; footer labels ≥11 units; radius chips ≥44 units with button role and selected state; immersive search control ≥44 units. Photo-nav, left-panel, and rail buttons received the same floor by source change (verified by review, not a rendered assertion).

Metrics: critique 21 → 27 → **28/40**; audit 13 → **14/20**. Only the spec-pinned emoji glyphs and the mode-toggle-in-tab-bar P2 remain.

## Final cycle — unified navigation (`OFFERS.MODE.SWITCH.001`)

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- presentationMode.test.tsx` | 3 failures: no tabs with names `offers.mode.feed` / `offers.mode.map`, no switch callbacks |
| GREEN | `npm test -- presentationMode.test.tsx` | PASS — 3 tests |
| Verification | `npm test` | 16 suites, 110/110 |
| Typecheck | `npx tsc --noEmit -p tsconfig.check.json` | clean |

Guarantees: header mode control exposes Feed/Map tabs with selected state; selecting Feed opens immersive mode; selecting Map closes it; cold start defaults to Feed; mode persists in session state.

Changes: new `PresentationModeSwitch`, `CreateOfferFab`, `NavIcon`; `App.tsx` footer reduced to four destinations plus one FAB, rendered in both presentations; `ImmersiveOfferFeed` left panel and duplicate footer removed, always-on top bar carries identity + mode control + tabs + search; `AppContext` cold-start mode set to Feed; translation keys for mode labels.

Specs: `OFFERS.MODE.SWITCH.001` created and Approved; v2.0 supersession notes in `OFFERS.FEED.IMMERSIVE.001`, `APP.SHELL.001`, `OFFERS.NAV.ADD.001`; affected BDD features updated; traceability row added.

Metrics: critique 21 → 27 → 28 → **30/40**; audit 13 → 14 → **16/20**. All original P1/P2 findings resolved. Remaining P3s: no SVG renderer dependency installed (icons are an authored monochrome set via text primitives); no tablet split view; global coverage still low outside the new modules.

Known gap: native device verification (both palettes, phone/tablet, orientations, large text) remains outstanding before shipping.

## SVG icon cycle (`react-native-svg`)

| Stage | Command | Result |
|---|---|---|
| Install | `npx expo install react-native-svg` | added `react-native-svg@15.16.0` (Expo SDK 58 compatible) |
| RED | `npm test -- navIcon.test.tsx` | 7 failures: `No instances found with node type: "Svg"` |
| GREEN | `npm test -- navIcon.test.tsx` | PASS — 7 tests (6 icons incl. search, decorative/screen-reader and color assertions) |
| Verification | `npm test` | 17 suites, 118/118; `tsc` clean |

`NavIcon` now renders six authored 24×24 stroke icons (account, suggestions, reports, offers, create, search) with one 1.8 stroke weight, `accessible={false}`, and inherited color. The immersive top-bar search glyph was converted to the same set. The remaining P3 from that cycle is now also resolved.

## Action-glyph SVG cycle

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- immersiveActionGlyphs.test.tsx` | 9 failures: `No instances found with node type: "Svg"` |
| GREEN | `npm test -- immersiveActionGlyphs.test.tsx` | PASS — 9 tests |
| Verification | `npm test` | 18 suites, 127/127; `tsc` clean |

`ImmersiveActionGlyphs.tsx` now draws comments, favorite, directions, vote-positive, vote-negative (mirrored thumbs-up via `G transform`), and report as 24×24 stroke SVGs at size 18, with active/inactive color from the palette and hidden from screen readers. Captions and all accessibility labels are unchanged. No emoji or glyph-font icons remain in the client's navigation or action chrome.

## Capture-driven layout fixes

From the phone captures supplied by the user:
- Immersive top bar was over-packed (logo + mode control + feed tabs + search on one row), squeezing `Ver todo / Favoritos` out of view. Split into two rows: identity + mode control + search on row one, feed tabs centered on row two. Added `APP.ACCESSIBILITY.UX.001-R5/R6` and matching BDD scenarios.
- Create FAB overlapped the immersive action rail (thumbs-down). Moved from `right: 20` to horizontally centered above the footer so it cannot cover any rail control. RED test `createOfferFab.test.tsx` confirmed the old right-anchored style; GREEN after the change.
- The gear circle visible at the right edge in both captures is not rendered by the app (no gear/settings control in source); treated as a device/dev overlay.

Verification: 19 suites, 129/129 tests; `tsc` clean. Fresh device captures requested to confirm visually.

## Tablet + light-theme capture follow-up

From the supplied tablet capture:
- Immersive chrome used theme ink colors on the fixed forest backdrop. In the light theme that rendered the top-bar title and feed tabs as dark-on-dark (near-invisible "DealsSeeker" and low-contrast tabs). R58 added to `OFFERS.FEED.IMMERSIVE.001` plus BDD scenario; fixed foreground to dawn ink `#f7f1e8` / mist ink `#c6d0c9` for top-bar title, feed tabs and action captions. RED test `immersiveChrome.test.tsx` confirmed `#1f3128` before the fix.
- The mode control stretched to the full tablet width because `modeSlot` used `flex: 1`. R59 added; capped at `maxWidth: 360`.
- The gear circle still appears near the top-right; no gear/settings control exists in source, so it remains classified as a device/capture overlay.

Verification: 20 suites, 131/131 tests; `tsc` clean. Re-capture requested for tablet light/dark and phone light theme.

## Safe-area band fix (impeccable P2)

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- shellChrome.test.ts` | 4 failures: `resolveShellChrome is not a function` |
| GREEN | `npm test -- shellChrome.test.ts` | PASS — 4 tests |
| Verification | `npm test` | 21 suites, 135/135; `tsc` clean |

`OFFERS.FEED.IMMERSIVE.001-R60` and BDD scenario added. `resolveShellChrome` in `src/utils/theme.ts` returns the fixed forest backdrop and light status-bar icons whenever the immersive feed is visible, in both themes; `App.tsx` applies it to the root `SafeAreaView` and `StatusBar`. The cream letterbox around the immersive surface is removed without weakening the night-footer or fixed-backdrop rules.

Impeccable validation snapshot for the light-theme footer/backdrop verdict: `.impeccable/critique/2026-11-19T22-50-29Z__design-md.md` (13/16 — both pinned rules kept).

## Large-text fix (200% capture)

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- immersiveCaptions.test.ts` | 4 failures: `shouldShowImmersiveCaptions is not a function` |
| GREEN | `npm test -- immersiveCaptions.test.ts` | PASS — 4 tests |
| Verification | `npm test` | 22 suites, 139/139; `tsc` clean |

`OFFERS.FEED.IMMERSIVE.001-R61` and BDD scenario added. `shouldShowImmersiveCaptions(isNarrow, fontScale)` hides decorative rail captions at text scale ≥1.5 (and on narrow screens); each rail control keeps its `accessibilityLabel`, so no information is lost. The 200% capture showed overlapping/clipped captions on the action rail; with captions hidden the six icon buttons fit and remain independently tappable.

Verification now covers: phone dark, tablet dark, tablet light, phone light, phone light with 200% text. Landscape remains implicitly covered by the tablet captures (tablets were held landscape); a dedicated phone-landscape capture is still optional.

## Final close-out

- Critique trend: **21 → 27 → 28 → 30 → 32/40** (Good). Final snapshot: `.impeccable/critique/2026-11-19T23-01-51Z__reactnative-src-screens-offersscreen-tsx-887c58d9.md`.
- Audit trend: **13 → 14 → 16 → 17/20** (Good). Final snapshot: `.impeccable/audit/2026-11-19T23-01-51Z__project.md`.
- Design validation snapshot for the pinned light-theme rules: `.impeccable/critique/2026-11-19T22-50-29Z__design-md.md` (13/16 — night footer and fixed forest backdrop both kept).
- All original P1/P2 findings from the first critique and audit are closed. No P0/P1/P2 remain.
- Test state: 22 suites, 139/139 passing; app source typechecks clean.
- Remaining P3 (not blocking): no in-product help surface, no tablet split view, global Jest coverage ~25% outside the new modules, dedicated phone-landscape capture optional.
- Storage note: audit reports were written with the same target slug as the critique, so the `critique-storage trend` index mixes 40- and 20-point denominators. The individual snapshot files are intact and the scores above are taken from those files.

## CI lock-in: typecheck + E2E

- **Typecheck:** `npm run typecheck` now passes with no errors. Fix: `/// <reference types="node" />` in `playwright.config.ts` (the file is untracked pre-existing work; `@types/node` was installed but not auto-included under Expo's tsconfig).
- **E2E:** added `test/e2e/ux-improvements.spec.ts` with six BDD-aligned Playwright tests: header mode switch, presentation persistence across navigation, filter preservation on switch, no-results/clear-filters recovery, failed-search retry via `page.route` 500, and single create FAB opening Add Offer.
- **Helper:** `switchToMap(page)` added to `test/e2e/helpers.ts`; applied only to the smart-search test in `offers.spec.ts` (the favorite/comment tests correctly remain in the immersive feed, whose action rail carries the accessibility labels their selectors use).
- **Result:** `npm run test:e2e` → **12/12 passed** (web export + API + Chromium). `npm test` → 139/139. `npm run typecheck` → clean. No stale servers left on 5005/8081.

Large-text behaviour is verified by device capture and Jest policy tests, not E2E (Playwright cannot emulate RN font scale).

## P3: repo-wide test debt

Coverage before: ~25%. After: **50.77% statements / 45.72% branches / 49.29% functions / 51.35% lines**, 28 suites / 195 tests. No production behavior changed; no new specs were needed.

New test files:
| File | Covers | Tests |
|---|---|---|
| `appContext.test.tsx` | bootstrap, session restore/clear, tab/overlay/mode navigation, preference persistence, report draft, scoped ops, logout | 9 |
| `authScreens.test.tsx` | login success/invalid/rejected, registration validation + success/failure, nav links | 10 |
| `presentationComponents.test.tsx` | StandardHeader section labels, AvatarPicker, LoadingOverlay, SplashScreen | 11 |
| `useOfferImageUri.test.tsx` | empty/remote/data-URI/URL-change image resolution | 4 |
| `secondaryScreens.test.tsx` | Favorites, Suggestions, Reports screens including drafts and failures | 11 |
| `accountAndOfferCard.test.tsx` | Account profile/settings/offer removal, OfferCard actions and badges | 11 |

Notable per-file results: `AppContext` 0.55% → 54%, `LoginScreen` 100%, `RegisterScreen` 90%, `SuggestionsScreen` 100%, `ReportsScreen` 97%, `AccountScreen` 91%, `FavoritesScreen` 82%, `OfferCard` 74%, `useOfferImageUri` 83%. Typecheck clean; E2E unchanged at 12/12 (no production changes in this pass).

Remaining coverage gaps (intentionally not chased — large, low-risk presentational or integration-heavy files): `MapPreview`, `OfferDetailModal`, `OfferCommentsModal`, `AddOfferScreen` still at 0%; `ImmersiveOfferFeed` 48%; `AppContext` 54% (unexercised API-wrapper branches).

## P3: in-product help surface (`APP.HELP.001`)

Shape decisions: contextual labelled help button in the Offers header (both presentations), essential flows only. Spec and `bdd/app-help.feature` created and Approved; traceability and bidirectional links added to `APP.SHELL.001` and `OFFERS.MODE.SWITCH.001`.

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- helpSheet.test.tsx` | FAIL — module not found |
| GREEN | `npm test -- helpSheet.test.tsx` | PASS — 3 tests (hidden state, five topics, labelled close) |
| Verification | `npm test` | 29 suites, 198/198; `npm run typecheck` clean; `npm run test:e2e` 13/13 (new help flow test included) |

Implementation: `HelpSheet.tsx` (Modal, five task-focused topics, accessible close), `help` added to the `NavIcon` SVG set, `common.help`/`common.close` and ten help strings in English and Spanish, wired into `OffersScreen` header controls and the immersive top bar via `helpControl`.

Tablet split view was deliberately not attempted: DESIGN.md pins the phone-first composition and explicitly bans a wide desktop reflow, so that would require a separate design decision.

## P3 close-out

| Item | Resolution |
|---|---|
| In-product help | Shipped (`APP.HELP.001`) |
| Global coverage | 25% → **64.69%** statements, 222 tests, 33 suites |
| Phone-landscape verification | Automated Playwright test at 844×390 asserting controls visible and no horizontal overflow; 14/14 E2E pass |
| Tablet split view | **Closed as by-design** — DESIGN.md states "No separate desktop grid is defined: the same phone-first composition ships to every target" and its Don't list bans "a wide desktop reflow". Implementing split view would contradict the approved design world; it needs an explicit redesign decision, not a P3 fix. |

Final large-file coverage: `OfferCommentsModal` 94%, `MapPreview` 69%, `OfferCard` 74%, `AddOfferScreen` 27%, `OfferDetailModal` 36% (remaining lines are mostly gesture math and fullscreen internals). `AppContext` 54% and `ImmersiveOfferFeed` 48% remain, but all their primary behavior paths are exercised.

Final verification: `npm test` 222/222, `npm run test:coverage` 64.69%, `npm run test:e2e` 14/14, `npm run typecheck` clean.
