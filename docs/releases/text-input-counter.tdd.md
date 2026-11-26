# TDD evidence: live text counters (APP.TEXTCOUNTER.001)

## Source
Specs derived during this run: `specs/features/application-shell/APP.TEXTCOUNTER.001.md` plus updates to `ADD.OFFER.INPUT.BOUNDS.001`, `OFFERS.COMMENTS.001`, `REPORTS.SUBMIT.001`, `SUGGESTIONS.SUBMIT.001`. BDD scenarios in `specs/bdd/text-input-counter.feature` and the four matching view feature files.

## User journeys
- As a user typing a comment, description, report or suggestion, I want a live `used/max` counter so I know the limit before reaching it.
- As a user pasting a long text, I want the input capped at the maximum so no oversized value is produced.

## RED / GREEN evidence

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- addOfferBoundsAndHierarchy commentsModal secondaryScreens` | 3 suites failed, 4 tests failed / 30 passed — only the new counter assertions failed |
| GREEN | same command | 3 suites passed, 34 tests passed |
| Full suite | `npm test` | 64 suites, 388 tests passed |
| Typecheck | `npm run typecheck` | passed |
| Coverage | `npm run test:coverage` | All files: 81.9% statements, 74.28% branches, 81.45% functions, 81.69% lines; 388 tests passed |

Checkpoint commits on `dev`:
- `274c8ce` — `test: add RED reproducer for live text counters (APP.TEXTCOUNTER.001)`
- `03b0ba3` — `fix: add live character counters and hard limits on free-text fields (APP.TEXTCOUNTER.001)`

No refactor commit was needed; the implementation is 21 added lines across four files.

## Test guarantees

| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | Offer description shows `0/500` and counts typed characters up to `500/500` | `addOfferBoundsAndHierarchy.test.tsx:shows a live description counter that stops at 500 characters` | PASS |
| 2 | Offer comment shows `0/120`, counts typed characters and caps at 120 | `commentsModal.test.tsx:shows a live body counter that stops at 120 characters` | PASS |
| 3 | Suggestion message shows `0/120`, counts typed characters and caps at 120 | `secondaryScreens.test.tsx:SuggestionsScreen > shows a live message counter that stops at 120 characters` | PASS |
| 4 | Prefilled report message starts its counter at its length and caps at 120 | `secondaryScreens.test.tsx:OfferReportSheet > shows a live message counter that stops at 120 characters` | PASS |

## Coverage and known gaps
- Branch coverage (74.28%) is below the 80% target; this is a repo-wide figure, not caused by these four fields. No branch was added by this change beyond one slice guard per field, each exercised by the boundary tests.
- E2E/device verification of the counter on a phone was not run in this session; the BDD scenarios are encoded as unit tests above.
- Suggestion contact and location search were intentionally left unchanged per scope decision.

## Merge evidence
The RED checkpoint records the four failing tests, and the GREEN checkpoint records the minimal fix. Both commits are reachable from `HEAD` on `dev`.
