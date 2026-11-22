# UI/UX Improvement Plan — Impeccable-Driven

## 0. Status & Purpose

- **P3 test-debt pass**: global Jest coverage ~25% → 50.77% with six new test files (AppContext, auth screens, secondary screens, account/OfferCard, presentation components, image hook); typecheck clean. Remaining 0% files are the large presentational/integration components (MapPreview, modals, AddOfferScreen).
- **P3 fully closed**: help surface shipped (`APP.HELP.001`); global Jest coverage ~25% → 64.69% (33 suites / 222 tests); automated phone-landscape E2E check added (14/14 E2E pass); tablet split view formally closed as by-design because DESIGN.md pins the phone-first composition and bans a wide desktop reflow. Typecheck clean.
- **Execution status**: CLOSED, CI-locked. Phases 1–5 executed. Spec-first + TDD cycles shipped: recoverable discovery states (`OFFERS.UX.001`, `APP.RESILIENCE.UX.001`), accessible control sizes (`APP.ACCESSIBILITY.UX.001`), unified navigation (`OFFERS.MODE.SWITCH.001`), SVG icon sets, and capture-driven layout/contrast/safe-area/large-text fixes. Final critique 32/40 (from 21), final audit 17/20 (from 13); 22 Jest suites / 139 tests and 12 Playwright E2E tests pass; `npm run typecheck` is clean. Device captures reviewed across phone dark/light, tablet dark/light and 200% text. No P0/P1/P2 findings remain; only P3 follow-ups are recorded in `.impeccable/tdd/offers-discovery-states.tdd.md`.
- **Status**: Planning draft — the original plan; the three shipped cycles above have been validated and approved.
- **Purpose**: Improve the DealsSeeker UI/UX in phased, evidence-first passes using the commands of the `impeccable` skill, while honoring the repo's spec-first workflow (AGENTS.md).
- **Scope**: `src/DealsSeeker.ReactNative` (single client for mobile + web). API changes only if a UX fix requires new behavior.
- **Important**: This document is a *plan*. The BDD scenarios in §4 are **proposed drafts**. Per AGENTS.md, each must be split into a spec file, validated, linked bidirectionally, set to `Approved`, and registered in `TRACEABILITY.md` **before** any corresponding implementation. No code change is valid without that step.

---

## 1. Impeccable skill review (what we're using)

`impeccable` is a design-director playbook of ~28 commands grounded in this project's `PRODUCT.md` + `DESIGN.md`. It keeps a critique history in `.impeccable/critique/` that later commands reuse.

| Category | Commands | Role in this plan |
|---|---|---|
| **Evaluate** | `critique`, `audit` | Produce the backlog everything else consumes. `critique` = UX heuristic scoring; `audit` = technical quality. |
| **Build** | `init`, `document`, `shape`, `extract`, `craft` | `shape` plans UX before code (no implementation). `init`/`document` are already satisfied here. |
| **Refine** | `polish`, `harden`, `onboard`, `bolder`, `quieter`, `distill` | Fix while preserving the incumbent "Trail Map" world. `polish` is the mandated closer. |
| **Enhance** | `animate`, `colorize`, `typeset`, `layout`, `delight`, `overdrive` | Targeted craft once the basics pass. |
| **Fix** | `clarify`, `adapt`, `optimize` | Copy, device/platform fit, performance. |
| **Iterate** | `live`, `generate` | **Not applicable** — web-only; this project is native/adaptive. |

Rules that govern our use of it:

- **Refinement preserves, redesign replaces.** DealsSeeker has an established, documented design world ("The Trail Map"). Default to refinement, not a visual overhaul.
- **Native platforms run critique/audit from source** — no browser detector, no overlays. Screenshots come from simulator / emulator / hardware, never a browser.
- **`polish` closes the loop** — it reads the latest critique snapshot and closes it when its P0/P1 issues are cleared.
- **Evaluations are read-only** — `critique` and `audit` need no spec change; commands that change observable behavior do.

---

## 2. Current state (from `impeccable context` + signals)

- ✅ `PRODUCT.md` and `DESIGN.md` exist and are strong → **skip `init` / `document`**.
- ⚠️ `critique.latest` is **null** → the app has been **never critiqued**. Biggest immediate gap.
- Platform is **adaptive** (mobile-native first, web secondary) → **`live`, `generate`, `impeccable detect` do not apply**; dev server is not running either.
- Strong existing assets: rich behavioral specs/BDD, JSON contracts, examples, traceability matrix, and an established color/type/radius system with daylight + forest-night palettes.
- Spec-first repo: behavior changes require an Approved spec + BDD scenario first.

**Design world to preserve (from DESIGN.md):** warm paper ground, forest ink, one terracotta waypoint accent, Georgia only for landmarks, 999px pills for tags/chips/filters, one soft card shadow, night-dark footer in both themes, both palettes tested, and no raw `lat`/`lng` in Add Offer / Offers views.

---

## 3. Phases (analyzed plan)

### Lead with these 3 (highest value)

1. `/impeccable critique src/DealsSeeker.ReactNative/src/screens/OffersScreen.tsx` — first-ever UX baseline; Nielsen scores, priority issues, and a snapshot for `polish`.
2. `/impeccable audit src/DealsSeeker.ReactNative` — native code-level check (a11y, perf, theming, HIG/Material conformance, adaptivity).
3. `/impeccable shape OffersFeed` — plan discovery-path improvements before code; returns a brief, no implementation.

### Phase 0 — Foundation (already done)
Product + design context captured. No action.

### Phase 1 — Diagnose (evidence before opinions)

| Command | Target | Why |
|---|---|---|
| `critique` | `OffersScreen.tsx` → `AddOfferScreen.tsx` → `AccountScreen.tsx` | Establish scores + per-surface snapshots. Native = design review only (no detector). |
| `audit` | `src/DealsSeeker.ReactNative` | Find systemic a11y/theming/platform gaps across all screens. |

Outputs feed §4 specs and the refinement commands below.

### Phase 2 — Decide direction

| Command | When |
|---|---|
| `shape <feature>` | For any new/reworked flow (empty states, onboarding, navigation). Produces a brief that feeds the spec-first workflow. |

### Phase 3 — Fix, mapped to findings

| Finding | Command | Proposed spec (§4) |
|---|---|---|
| Vague labels, errors, empty-state copy, localization text | `/impeccable clarify` | `OFFERS.UX.001`, `ADD.OFFER.UX.001` |
| First-run / no-offers-nearby / favorites empty + activation | `/impeccable onboard` | `APP.ONBOARD.001` |
| Offline, 429 rate-limit, location-provider failures, long/RTL text | `/impeccable harden` | `APP.RESILIENCE.UX.001` |
| Tablet / landscape / iOS-vs-Android conformance | `/impeccable adapt` | `APP.ADAPTIVE.UX.001` |
| Feed scroll / photo performance | `/impeccable optimize` | (existing perf specs) |
| Spacing, type scale, hierarchy drift | `/impeccable layout` / `typeset` | `APP.ACCESSIBILITY.UX.001` |
| Flat/bland vs over-loud surfaces | `bolder` / `quieter` / `colorize` / `distill` | within DESIGN.md rules |
| Purposeful motion | `/impeccable animate` | within DESIGN.md rules |

### Phase 4 — Close

- `/impeccable polish <surface>` — final QA on each touched path; clears the critique snapshot when its issues are fixed.

### Phase 5 — Verify & reconcile with the workflow

- Re-run `critique` + `audit` to show score movement.
- For observable behavior changes: **spec → validate → Approve → implement** (AGENTS.md BDD flow).
- Verify on device with `npm run test:e2e` (Maestro) and simulator/emulator/hardware captures (both palettes, phone + tablet, both orientations, 200% text scaling).
- Run `ponytail-review` on the final diff; reconcile structural findings with `design-pattern-review`.

### Suggested starting scope
Start with the **discovery path** — `OffersScreen.tsx` (immersive feed, search, cards, map) — the core user job and the most reused surface. Then **AddOfferScreen** (contribution job), then **AccountScreen/Login/Register** (first-run + trust).

---

## 4. Proposed BDD scenarios (DRAFT — gate before implementation)

These are the acceptance criteria the improvements must satisfy. They follow the ID convention `<VIEW>.<AREA>.<NNN>` and include positive + edge scenarios. **Each feature below becomes its own `specs/features/<view-slug>/` spec and `specs/bdd/<name>.feature` file once validated and approved.**

### 4.1 `OFFERS.UX.001` — Offers discovery clarity & empty states (Approved, implemented)
*Target file: `specs/bdd/offers-ux.feature` · related: `OFFERS.FEED.IMMERSIVE.001`, `OFFERS.SEARCH.001`, `OFFERS.GRID.CARDS.001`*

```gherkin
Feature: Offers discovery clarity and recoverable empty states
  As a deal hunter
  I want the discovery path to make the primary action obvious and recover cleanly from empty results
  So that I can find a relevant nearby offer without dead ends

  Scenario: One primary action leads the discovery path
    Given the user is on the Offers view with offers available
    When the view is rendered
    Then a single primary discovery action is visually dominant
    And the waypoint accent is reserved for the active path and primary action
    And secondary actions remain neutral

  Scenario: Search with no results offers a next step
    Given the user searched with a tag that returns no offers
    When the no-results state is displayed
    Then a message explains that no offers matched
    And an action to clear the search or try a nearby tag is available
    And the user can return to the full offer list

  Scenario: Empty feed state directs the user to contribute
    Given no offers are available in the user's radius
    When the Offers view loads
    Then an empty-state message explains why the feed is empty
    And an action to create the first offer is available
```

### 4.2 `APP.ONBOARD.001` — First run to first value (Approved, implemented in Cycle F)
*Target file: `specs/bdd/app-onboarding.feature` · related: `APP.SHELL.001`, `OFFERS.UX.001`*

```gherkin
Feature: First-run guidance to first value
  As a first-time deal hunter
  I want to reach a relevant nearby offer quickly
  So that I understand the product's value without a lengthy tutorial

  Scenario: First launch guides the user to nearby offers
    Given the app is launched for the first time with an authenticated session
    When the first view is displayed
    Then the immersive offers feed is displayed as the default presentation
    And any guidance is brief, optional, and skippable

  Scenario: Guidance is not repeated for returning users
    Given the user has already completed first-run guidance
    When the app is launched again
    Then first-run guidance is not displayed again

  Scenario: Location permission denial still leads to value
    Given the user denies location permission on first run
    When the Offers view loads
    Then an explanation of what was missed is shown
    And a way to browse without precise location remains available
```

### 4.3 `APP.RESILIENCE.UX.001` — Actionable error and edge states (Approved, implemented)
*Target file: `specs/bdd/app-resilience-ux.feature` · related: `APP.RATE.LIMIT.001`, `APP.LOCATION.PROVIDER.RESILIENCE.001`, `APP.API.CONNECTIVITY.001`*

```gherkin
Feature: Actionable error, offline, and localization states
  As a user on a real mobile connection
  I want errors to explain what happened and how to recover
  So that I am never stranded by a failed request or unusual input

  Scenario: Offline load shows a retry path
    Given the device has no network connection
    When the user attempts to load offers
    Then a message states the connection is unavailable
    And a retry action is available

  Scenario: Rate-limit response is presented accessibly
    Given the API responds with a rate-limit error
    When the error reaches the client
    Then the message states the limit in plain language
    And the user is told when they can try again
    And no internal status code is shown as the primary message

  Scenario: Long or localized text does not break the layout
    Given a localized offer title substantially longer than its English text
    When the offer is displayed
    Then the title wraps or truncates without overlapping controls
    And all primary actions remain reachable
```

### 4.4 `ADD.OFFER.UX.001` — Contribution flow feedback (Approved, implemented in Cycle F)
*Target file: `specs/bdd/add-offer-ux.feature` · related: `ADD.OFFER.LAYOUT.001`, `ADD.OFFER.LOCATION.001`, `ADD.OFFER.DESCRIPTION.TAGS.001`*

```gherkin
Feature: Clear contribution flow feedback
  As a community contributor
  I want clear feedback while creating an offer
  So that I can complete a valid offer without guessing what failed

  Scenario: Missing required content is explained at the point of action
    Given the user is in the Add Offer view
    And a required item such as photo, description, tag, or location is missing
    When the user attempts to submit
    Then the request is not sent
    And each missing item is identified with guidance to correct it
    And entered data is preserved

  Scenario: Successful contribution confirms the outcome
    Given the user submitted a valid offer
    When the create-offer request succeeds
    Then the app confirms the offer was created
    And the user is returned to the Offers view

  Scenario: Coordinate privacy is preserved
    Given an offer with a confirmed location is displayed in Add Offer or Offers
    When the user views the location information
    Then no raw latitude or longitude values are shown to the user
```

### 4.5 `APP.ADAPTIVE.UX.001` — Device class and orientation (Approved, implemented in Cycle F; tablet split-view remains out of scope by design)
*Target file: `specs/bdd/app-adaptive-ux.feature` · related: `OFFERS.FEED.RESPONSIVE.001`, `OFFERS.GRID.CARDS.001`*

```gherkin
Feature: Adaptive presentation across device classes
  As a user on a phone, tablet, or in landscape
  I want the layout to restructure for my screen
  So that core discovery and contribution tasks remain usable everywhere

  Scenario: Tablet presentation restructures rather than stretches
    Given the app is running on a tablet-sized screen
    When the Offers view is displayed
    Then the layout uses the available width with a multi-column or split arrangement
    And the phone layout is not simply scaled up

  Scenario: Landscape orientation keeps controls reachable
    Given the device is in landscape orientation
    When the user views an offer
    Then primary discovery and action controls are not clipped or overlapped
    And no core functionality is hidden

  Scenario: Phone-sized window on a tablet still works
    Given a tablet is in a split-screen or narrow window
    When the Offers view is displayed
    Then the compact layout is used and controls remain reachable
```

### 4.6 `APP.ACCESSIBILITY.UX.001` — Accessibility and both palettes (Approved, implemented)
*Target file: `specs/bdd/app-accessibility-ux.feature` · related: `APP.THEME.001`, `OFFERS.FEED.IMMERSIVE.001`*

```gherkin
Feature: Accessible and theme-complete surfaces
  As a user with accessibility needs or a dark-theme preference
  I want every surface to be readable and operable in both themes
  So that I can use the app in my own context

  Scenario: Touch targets meet the platform minimum
    Given any supported screen on a phone
    When its tappable controls are rendered
    Then each control meets the platform minimum touch target size
    And adjacent targets have sufficient spacing

  Scenario: Both palettes hold contrast
    Given the active theme is light
    When a surface is rendered
    Then text and controls meet contrast requirements
    When the active theme switches to dark
    Then the forest-night palette is applied and contrast is maintained

  Scenario: Large text scaling does not clip content
    Given the system font size is set to a large accessibility size
    When a form or offer detail is displayed
    Then labels and controls remain readable and unclipped
    And primary actions remain reachable
```

---

## 5. Traceability rows to add (when specs are created)

All six rows below have been added to `specs/traceability/TRACEABILITY.md`, with bidirectional `Related Specs` links in the dependent specs. Original table retained for reference:

| Spec ID | Feature File | Contract | Examples |
|---|---|---|---|
| `OFFERS.UX.001` | `bdd/offers-ux.feature` | N/A | TBD render fixture |
| `APP.ONBOARD.001` | `bdd/app-onboarding.feature` | N/A | TBD |
| `APP.RESILIENCE.UX.001` | `bdd/app-resilience-ux.feature` | `contracts/json-schema/problem-details.schema.json` | existing rate-limit / location examples |
| `ADD.OFFER.UX.001` | `bdd/add-offer-ux.feature` | `contracts/json-schema/add-offer-draft.schema.json` | existing add-offer examples |
| `APP.ADAPTIVE.UX.001` | `bdd/app-adaptive-ux.feature` | N/A | `examples/offers-view/offers-immersive-feed.responsive.json` |
| `APP.ACCESSIBILITY.UX.001` | `bdd/app-accessibility-ux.feature` | N/A | TBD |

Also add bidirectional `Related Specs` entries in the dependent specs listed under each feature above.

---

## 6. Guardrails / do-not-violate

- **Spec-first**: no behavior implementation until its spec is validated and `Approved` (AGENTS.md).
- **Implementation scope**: API + React Native only; the React Native project is the single client.
- **Design world**: preserve "The Trail Map" — terracotta only on the active path, Georgia only for landmarks, 999px pills, one soft shadow, night-dark footer in both themes.
- **Coordinate privacy**: no raw `lat`/`lng` in Add Offer or Offers views.
- **Native verification**: screenshots from simulator/emulator/hardware, both palettes, phone + tablet, both orientations, text scaling. Web verification via the `browser` skill.
- **Refinement, not redesign**: do not replace the incumbent world without explicit approval.

---

## 7. Next action (resolved)

The Phase 1 evaluations were run and re-run; their findings drove the six §4 specs and the five cycles recorded in §8. All §4 specs are now Approved and implemented, and all §5 rows are in the traceability matrix. The remaining verification is native/screen-reader sign-off (§6) and the optional focus-return P2 from the final critique snapshot — not a new spec from this section.

---

## 8. Fresh evidence pass (2026-11-21) — reopened after closure

The original plan was closed, so the next iteration began with a new read-only critique + native audit of the current source (no spec change needed for evaluation).

- **Fresh critique**: 29/40 (Good), down from the recorded 32/40 because a deeper pass surfaced a silent New York fallback, action feedback dropped in the immersive presentation, six equal-weight offer actions, and touch-target gaps in newer controls. Snapshot: `.impeccable/critique/2026-11-21T17-06-00Z__reactnative-src-screens-offersscreen-tsx-887c58d9.md`.
- **Fresh audit**: 13/20 (Acceptable), down from 17/20. The earlier pass was shallow: the new pass found no accessibility roles/labels/states/live regions across 11 lower-coverage screens, sub-44 targets throughout, fixed `lineHeight` clipping at 200% text, a map WebView that blocks pinch-zoom, and an off-palette map-pin color. Snapshot: `.impeccable/audit/2026-11-21T17-06-06Z__project.md`.
- **Direction chosen by the user**: accessibility baseline first; scope = everything found; native visual verification by user-supplied captures.

### Cycle A — Accessibility baseline (COMPLETE)

Approved specs: `APP.ACCESSIBILITY.UX.002`, `APP.ACCESSIBILITY.UX.003`, `ADD.OFFER.LOCATION.003`. Three BDD features added; traceability and bidirectional links updated. TDD evidence: `.impeccable/tdd/accessibility-baseline.tdd.md`.

Delivered: roles, labels and states across auth, Add Offer, account, secondary, detail/comments and immersive surfaces; `announceStatus` live-region announcements; modal focus confinement; accessible center-pin action; 44-unit floor for immersive tabs, overlay chips and dialog buttons.

Verification: `npm test` 36 suites / 235 tests, `npm run typecheck` clean. Native device/screen-reader capture verification is outstanding (user-supplied).

### Cycle B — Location trust (COMPLETE)

Approved spec `APP.LOCATION.FALLBACK.001` and `bdd/app-location-fallback.feature`. When device location is denied or fails, the Offers view no longer labels the fallback area as "current": it shows an approximate-area notice with distinct "Use my location" and "Dismiss" actions in both presentations, announces the change, and re-searches on retry. Area labels describe the resolved location after a successful retry, and no raw coordinates surface.

### Cycle C — Adaptivity (COMPLETE)

Approved spec `APP.ADAPTIVE.UX.002` (v1.1) and `bdd/app-adaptive-ux-002.feature`. Delivered: 44-unit floor across auth, offer cards, Add Offer, account, secondary screens, modals and overlays; removed fixed `lineHeight` from offer/detail descriptions so text scales; restored map pinch-zoom; Reduce Motion now drives modal transitions, zoom springs and animated carousel scroll through `useReduceMotion` + `resolveMotionPreferences`. R7/BDD added when E2E showed the action rail colliding with the top bar on short viewports — captions are now omitted when vertical space is insufficient, with controls still labelled.

E2E caught and fixed three regressions from the fallback notice: duplicate "Retry"/"Close" accessible names, and the top-bar containers swallowing taps on the offer action rail. All 14 E2E flows pass again.

Verification after B + C: `npm test` 38 suites / 245 tests, `npm run typecheck` clean, `npm run test:e2e` 14/14.

### Cycle D — Feedback & copy (COMPLETE)

Approved spec `OFFERS.UX.002` and `bdd/offers-action-feedback.feature`. Favorite/vote outcomes are now shown as an announced, non-blocking toast inside the immersive feed. A search no longer clears an action confirmation, and each new action replaces the previous one. The EN unavailable label changed from "removed" to "No longer available" to match the ES semantics.

### Cycle E — Theming & cleanup (COMPLETE)

Approved spec `APP.POLISH.UX.001` and `bdd/app-polish-ux.feature`. Embedded maps now receive the active palette and use its accent/danger/success roles instead of an invented red and off-token background. Detail, comments and fullscreen dialogs close when the scrim is tapped. Successful submissions remain visible for a beat before navigating. Auth keyboards use padding on both platforms, Add Offer scroll content respects the bottom safe-area inset, primary buttons use the pinned 28px radius, and placeholder glyphs are unified.

Privacy note carried forward: raw coordinates are still serialised into the map WebView document and `postMessage` payloads. This is inherent to rendering a map and is not user-visible, but it should be recorded in the privacy threat model rather than treated as a UI breach.

### Status

All five cycles (A–E) from the 2026-11-21 fresh evidence pass are complete.

### Capture review follow-up (light-theme phone, Mapa + Feed)

Two user-supplied captures were checked against the source. The Map presentation and the immersive Feed presentation matched the implementation (mode switch, ES locale strings, radius chips, OpenLayers badge, caption-less icon rail, centered FAB, night footer). The gear circle and "States" text in the captures are device/status-bar overlays — no such controls or strings exist in source.

One real defect was found in the Feed capture: the availability counts under the thumbs buttons used `palette.inkMuted` (`#5f6d63` in the light theme) on the fixed forest backdrop (`#1b2f28`), roughly 2.7:1 contrast. `APP.THEME.001` v0.3 adds R9 plus a BDD scenario; `immersiveInk` / `immersiveInkMuted` tokens were added in `theme.ts` and applied to the rail counts, top-bar title and feed tabs so all fixed-backdrop chrome shares one foreground treatment. RED → GREEN evidence in commit `3b905ff` → `25ad958`.

All P3 findings from the fresh audit are now closed: placeholder glyphs unified, primary radius pinned, scrim-tap dismissal, keyboard avoidance, safe-area insets on every scrollable surface, success-before-navigation, status severity colors, system font stack in the embedded map, shared auth form styles, and the WebView coordinate-privacy note recorded. `APP.POLISH.UX.001` v1.1 added R7–R9 plus matching BDD scenarios.

Final verification after Cycles A–E: `npm test` 39 suites / 253 tests, `npm run typecheck` clean, `npm run test:e2e` 14/14.

### Cycle F — Original plan §4 completion (COMPLETE)

The three §4 draft specs never created earlier are now Approved, linked in the traceability matrix, and implemented:

- `APP.ONBOARD.001` — first-run guidance: a brief, skippable modal shown once per device, persisted via `dealseeker.onboarding.completed`; the immersive feed remains the default presentation and location denial still offers a browse path.
- `ADD.OFFER.UX.001` — contribution feedback formalized: missing-item validation, preserved input, announced outcomes, perceivable success before navigation, and coordinate privacy. These behaviors were already present across other specs; this spec makes them explicit and BDD-verifiable.
- `APP.ADAPTIVE.UX.001` — device-class behavior formalized: phone-first composition on all targets, additional grid columns via `resolveOffersGridColumns`, landscape control reachability, and compact layout in narrow windows. Tablet split-view remains explicitly out of scope by design.

E2E seeds the first-run flag for returning-user journeys so the one-time tip does not block them.

Final verification: `npm test` 41 suites / 258 tests, `npm run typecheck` clean, `npm run test:e2e` 14/14. Outstanding: VoiceOver/TalkBack sign-off, remaining palette/orientation captures, and the optional dialog focus-return P2 from the final critique.

---

## 9. Shape brief — OffersFeed (retrospective)

- **Job and audience:** a local deal hunter discovers a nearby offer quickly, usually one-handed and often on a mobile connection; mode is Operate, and the success criterion is reaching a relevant offer without dead ends.
- **Outcome and proof:** the primary action is advancing through the immersive feed and acting on an offer; recovery states (empty, no-results, search failure, location fallback) each expose a next step, and raw coordinates never surface.
- **Selected direction:** preserve the established "Trail Map" world — fixed forest backdrop, one terracotta accent on the active path, night footer, Georgia landmarks — and refine rather than redesign. The focal moment is the full-screen offer with its action rail; the top bar carries identity, presentation mode, tabs and search.
- **Scope and boundaries:** one phone-first composition ships to every target; no wide desktop reflow, no third accent color, no custom global navigation. Tablet split-view is an explicit anti-goal.
- **Interaction and layout:** two-row top bar, paged feed with swipe/photos and keyboard equivalents on web, bottom footer plus one centered create FAB, announced status feedback, Reduce Motion and 200%-text policies, 44-unit touch floors.
- **Constraints and open decisions:** spec-first for every behavior change; EN/ES localization; Dapper/SQLite API behind a minimal client contract; native visual and screen-reader verification still required before shipping.

### Final critique follow-up (both P2s closed)

The closeout critique (37/40) left two P2s, and both were implemented through the spec-first flow:

- **Primary offer action** — `OFFERS.UX.002` v1.1 added R8 plus a BDD scenario. Directions is now the single terracotta-marked rail action with a white glyph; a subtle divider separates it from the maintenance actions (report, votes). RED/GREEN: `82d0a3e` → `ce5bb0d`/`80e2745`.
- **Dialog focus return** — `APP.ACCESSIBILITY.UX.003-R5` was already Approved; a shared `focusReturn.ts` helper now restores assistive-technology focus from the opener ref on dismissal of Help, Search, Offer Detail and Comments dialogs.

Verification: `npm test` 42 suites / 260 tests, `npm run typecheck` clean, `npm run test:e2e` 14/14. The plan now has no open implementation items; only native/screen-reader sign-off remains.

