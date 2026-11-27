# TDD evidence — Cycle L: single coverage-distance control (`OFFERS.FILTER.SIMPLIFICATION.001`)

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md` §10.8 and §10.11 (open decision 2). User approved simplification for both presentations.
- Shape brief: job/audience (phone deal hunter, Operate), outcome (read/change distance in one decision), direction (one pill + expanded option list), scope (both presentations, no API change), anti-goals (no new dependency, no nested sheet).
- Spec: approved `OFFERS.FILTER.SIMPLIFICATION.001` v1.1 with BDD, traceability row (offer-search-request schema), bidirectional links in `OFFERS.SEARCH.001`, `APP.ADAPTIVE.UX.002`, `APP.BOTTOM_SHEET.001`, `OFFERS.MODE.SWITCH.001`.
- Spec v1.1 changed the picker constraint from a nested bottom sheet to inline expansion, avoiding a sheet inside the immersive search sheet.

## User journeys
- As a deal hunter, I want to read my current coverage distance at a glance and change it in one tap.
- As a user with assistive technology, I want the current distance and its options announced.

## RED / GREEN
- RED: `npm test -- coverageDistanceControl.test.ts` → suite failed to run: `Cannot find module .../components/CoverageDistanceControl` (compile-time RED). Two follow-up probe failures were test-harness issues (hoisted `View` in a jest mock), fixed before the valid RED state was recorded.
- GREEN: same command → 1 suite / 2 tests passed.
- Full suite: `npm test` → 70 suites / 417 tests passed; `npm run typecheck` clean.
- Existing tests that encoded the five-chip UI were updated to the approved behavior (selected value legibility, touch floor, search-overlay accessible state).

## What the tests guarantee
| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | One visible control shows the current distance, no 500 m chip row | `coverageDistanceControl.test.ts:shows one control with the current distance` | unit | PASS |
| 2 | Expanding shows all five values with correct selected state; selection calls onChange | `coverageDistanceControl.test.ts:opens the full distance list and applies a selection` | unit | PASS |
| 3 | Map view uses a 48-unit pill and no five simultaneous chips | `controlSizes.test.tsx:gives the coverage control a 48-unit touch target…` | unit | PASS |
| 4 | Immersive search sheet exposes the selected distance via radio state | `accessibilitySurfaces.test.tsx:labels the search-overlay chips and buttons with their state` | unit | PASS |
| 5 | Presentations and scroll behavior still work | `presentationMode.test.tsx` | unit | PASS |

## Implementation
- New `CoverageDistanceControl.tsx` owns `COVERAGE_DISTANCE_OPTIONS` (reused from the old overlay constant), a pill showing `Distance: <value> m`, and an inline expandable radio list.
- `OffersScreen.tsx`: chip row replaced by the control; radius change still triggers `search` immediately; dead `radiusOptions` constant and `radiusChip` style removed.
- `ImmersiveSearchOverlay.tsx`: chip row replaced by the same control; local constant and dead styles removed.
- No API/contract/result-ordering changes.

## Checkpoint commits (on `dev`)
1. `d42af5e` — `test: add RED reproducer for single coverage-distance control`.
2. `4bb516e` — `fix: collapse coverage chips into one distance control`.
3. Evidence report commit follows.

## Known gaps
- No device E2E and no visual capture of the expanded control at the user's request.
- The option list expands inline rather than as a sheet; the original shape brief's "picker" intent is met, but the spec constraint was amended to permit inline expansion (v1.1).
