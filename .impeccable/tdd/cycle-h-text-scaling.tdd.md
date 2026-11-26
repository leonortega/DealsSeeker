# TDD evidence — Cycle H: visible action captions and chrome text scaling (`APP.ADAPTIVE.UX.002`, `OFFERS.ACTIONS.LABELS.001`)

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md` §10.4 (Cycle H).
- Specs: `APP.ADAPTIVE.UX.002` v1.2 (R7 refined, R8 added), new approved `OFFERS.ACTIONS.LABELS.001` v1.0, bidirectional links in `OFFERS.UX.002`, `OFFERS.FEED.IMMERSIVE.001`, `APP.ACCESSIBILITY.UX.001`.
- BDD: `specs/bdd/app-adaptive-ux-002.feature`, `specs/bdd/offers-action-labels.feature`. Traceability row added for the new spec.
- No contracts/examples: the behavior is visual/interactional with no data shape.

## Spec-first reconciliation
- `OFFERS.FEED.IMMERSIVE.001-R61` already permits caption omission at increased text sizes when controls keep accessible names. R2 was narrowed accordingly during validation: on a genuinely short viewport captions may be omitted, but actions stay independently tappable and AT-labelled. No new disclosure UI was introduced.
- Hidden app title on narrow screens remains by design (`APP.BRAND.001-R3`).

## User journeys
- As a phone user, I want every offer action labelled so I don't have to memorize an icon.
- As a user with large text enabled, I want navigation labels to stay readable without wrapping mid-word.

## RED / GREEN
- RED: `npm test -- immersiveCaptions.test.ts adaptiveTextScaling.test.tsx` → 2 suites failed / 4 tests failed, 1 passed:
  - `shouldShowImmersiveCaptions(700)` and `(640)` returned `false` because the old rule gated on `isNarrow === false` and `fontScale < 1.5`.
  - Footer and presentation-switch labels had no `maxFontSizeMultiplier` (and footer had no `numberOfLines`).
- GREEN: same command → 2 suites / 5 tests passed.
- Full unit suite: `npm test` → 67 suites / 405 tests passed; `npm run typecheck` clean.
- One pre-existing test (`controlSizes.test.tsx`) encoded the old wrapping behavior and was updated to the newly approved requirement.

## What the tests guarantee
| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Captions appear on a phone-sized measured height | `immersiveCaptions.test.ts:shows captions on a phone-sized viewport` | unit | PASS |
| 2 | Captions hide only when measured height is genuinely short; 640 is the boundary | `immersiveCaptions.test.ts` (2 tests) | unit | PASS |
| 3 | Footer labels stay on one line with bounded text scaling | `adaptiveTextScaling.test.tsx:bounds footer label scaling…` | unit | PASS |
| 4 | Presentation-switch labels bound text scaling | `adaptiveTextScaling.test.tsx:bounds presentation switch label scaling` | unit | PASS |
| 5 | Existing footer/control floor assertions still hold | `controlSizes.test.tsx` (updated test + neighbours) | unit | PASS |

## Implementation
- `ImmersiveOfferFeed.tsx`: `shouldShowImmersiveCaptions(availableHeight)` no longer depends on width or font scale; the call site passes the measured `pageHeight`. `fontScale` removed from destructuring.
- `AppFooterBar.tsx`: label Text gets `maxFontSizeMultiplier={1.2}` and `numberOfLines={1}`.
- `PresentationModeSwitch.tsx`: label Text gets `maxFontSizeMultiplier={1.2}`.

## Checkpoint commits (on `dev`)
1. `af27927` — `test: add RED reproducer for phone action captions and chrome text scaling`.
2. `910e7d0` — `fix: show phone action captions and bound chrome label scaling`.
3. Evidence report commit follows.

## Known gaps
- Device E2E not run at the user's request.
- A manual 150%-text screenshot was attempted but the fresh dev build's onboarding sheet and Gboard overlay made reliable field entry impractical; visual confirmation of the feed at 150% is still outstanding. Baseline (pre-fix) capture `impeccable-large-text2.png` shows the original wrapped "Suggestion / s" and icon-only rail.
- The review's earlier incidental finding — `OffersStatePanel` rendering above the absolute top bar in the no-results state — remains out of scope for this cycle.
