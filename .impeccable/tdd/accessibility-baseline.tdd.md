# TDD Evidence — Accessibility baseline (Cycle A)

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md` (fresh evidence pass, 2026-11-21)
- Critique: `.impeccable/critique/2026-11-21T17-06-00Z__reactnative-src-screens-offersscreen-tsx-887c58d9.md` (29/40)
- Audit: `.impeccable/audit/2026-11-21T17-06-06Z__project.md` (13/20)
- Specs: `APP.ACCESSIBILITY.UX.002`, `APP.ACCESSIBILITY.UX.003`, `ADD.OFFER.LOCATION.003` (all Approved)
- BDD: `specs/bdd/app-accessibility-control-semantics.feature`, `specs/bdd/app-announced-feedback.feature`, `specs/bdd/add-offer-accessible-map-pin.feature`

## User journeys
1. As a user relying on assistive technology, I want every control announced by name, role, and state so I can complete contribution and account tasks independently.
2. As a user relying on assistive technology, I want outcomes announced and dialogs to hold focus so I never lose my place.
3. As a contributor using assistive technology, I want to place the offer pin without a pointer gesture so I can contribute an accurate location independently.

## RED / GREEN / REFACTOR evidence

| Stage | Command | Result |
|---|---|---|
| RED slice 1 | `npm test -- accessibilitySemantics.test.tsx` | FAIL — 5 tests: no auth labels, no roles, no favorite selected state, no photo-dot labels, no login-failure announcement |
| GREEN slice 1 | `npm test -- accessibilitySemantics.test.tsx` | PASS — 5 tests |
| RED slice 2 | `npm test -- accessibilitySurfaces.test.tsx` | FAIL — 5 tests: no registration labels, no center-pin action, no overlay chip state, tabs below 44, no modal focus/label |
| GREEN slice 2 | `npm test -- accessibilitySurfaces.test.tsx` | PASS — 5 tests (after two test-harness corrections: exact/regex text match, `getByTestId`) |
| RED slice 3 | `npm test -- secondaryA11y.test.tsx` | FAIL — 2 tests: no suggestion field labels, no offer-id association |
| GREEN slice 3 | `npm test -- secondaryA11y.test.tsx` | PASS — 3 tests (one already green: labelled help close control) |
| Verification | `npm test` | 36 suites, 235/235 passing |
| Typecheck | `npm run typecheck` | clean |

## Test specification

| # | Guarantee | Test | Type | Result |
|---|---|---|---|---|
| 1 | Auth inputs expose labels | `accessibilitySemantics.test.tsx: labels both auth inputs` | component | PASS |
| 2 | Login action is a button, registration entry is a link | same file: `announces the login button...` | component | PASS |
| 3 | Favorite state and disabled votes are announced on the card | same file: `exposes favorite selected state...` | component | PASS |
| 4 | Immersive favorite state and photo dots are labelled | same file: `exposes favorite selected state and labels photo dots` | component | PASS |
| 5 | Login failure is announced | same file: `announces a login failure...` | component | PASS |
| 6 | Registration inputs labelled; validation announced | `accessibilitySurfaces.test.tsx` | component | PASS |
| 7 | Accessible center-pin action updates the draft location | same file | integration | PASS |
| 8 | Overlay chips expose role/state; actions are labelled | same file | component | PASS |
| 9 | Immersive tabs meet the 44-unit floor | same file | component | PASS |
| 10 | Detail dialog confines focus and closes by a labelled control | same file | component | PASS |
| 11 | Suggestion fields labelled; failed submit announced | `secondaryA11y.test.tsx` | component | PASS |
| 12 | Report offer-id field associated with its visible label | same file | component | PASS |
| 13 | Help close control is labelled | same file | component | PASS |

## Guarantees delivered
- `accessibilityRole` on every interactive control in the contribution, auth, account, secondary, detail/comments and immersive surfaces touched.
- `accessibilityLabel` on every input and icon/glyph-only control; decorative glyphs hidden from the accessibility tree.
- `accessibilityState` for favorite selected, vote/gallery disabled, radius chip selected, and settings toggles.
- `announceStatus` helper wraps `AccessibilityInfo.announceForAccessibility`; every status-setting site in the touched screens now announces through a local `reportStatus`.
- `accessibilityViewIsModal` on the detail, fullscreen and help dialogs; the redundant no-op help-sheet focus stop removed.
- A labelled "set pin at map center" action reuses the existing `handleMapTap` flow, so its result matches a direct map selection and preserves coordinate privacy.
- Immersive feed tabs, search-overlay chips and dialog buttons now meet the 44-unit touch floor.

## Checkpoint commits (branch `dev`)
- `ebd2443` — test: RED reproducer for control semantics and announced feedback
- `66516fa` — feat(accessibility): approved a11y specs and first GREEN slice
- `bddf467` — test: RED reproducer for contribution/auth surfaces and dialogs
- `36c3af5` — feat(accessibility): GREEN slice 2
- `de0e9d1` — test: RED reproducer for secondary-screen labels and status
- `9665d0c` — feat(accessibility): GREEN slice 3

## Known gaps
- No native device captures in this environment; screen-reader behavior and focus order need VoiceOver/TalkBack verification on hardware before shipping (user agreed to supply captures).
- Remaining cycles from the fresh audit: B (fallback-location disclosure), C (44-unit floor everywhere else, fixed lineHeight, map pinch-zoom, Reduce Motion), D (immersive action feedback, copy), E (map palette tokens and P3 cleanup).
- Test file corrections during GREEN were harness fixes (`getByTestId` instead of an unavailable `UNSAFE_getAllByType`; regex text match for a combined label), not weakened assertions.
