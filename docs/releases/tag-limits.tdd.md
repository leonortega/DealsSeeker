# TDD evidence: tag length and count caps (ADD.OFFER.TAG.LIMIT.001-R7/R8)

## Source
Spec updated before code: `ADD.OFFER.TAG.LIMIT.001` v1.1 adds R7 (40-character normalized cap per tag) and R8 (caps apply to edit drafts and the final word committed at submission), with matching BDD scenarios in `specs/bdd/add-offer-tag-limit.feature`. `add-offer-draft.schema.json` now declares `maxLength: 40` on tag items, alongside the existing `maxItems: 10`.

## User journeys
- As a user describing an offer, I want each tag capped at 40 characters and the list capped at 10, so my draft matches the API contract.
- As a user editing an offer with legacy/oversized tags, I want them clamped on load rather than rejected at submit.

## RED / GREEN evidence

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- addOfferTagLimit` | 1 suite failed, 2 tests failed / 3 passed — only the new length/count assertions failed |
| GREEN | same command | 1 suite passed, 5 tests passed |
| Full suite | `npm test` | 64 suites, 395 tests passed |
| Typecheck | `npm run typecheck` | passed |
| Coverage | `npm run test:coverage` | All files: 82.09% statements, 74.35% branches, 81.65% functions, 81.88% lines; 395 tests passed |

Checkpoint commits on `dev`:
- `1062a5a` — `test: add RED reproducer for per-tag length and count caps (ADD.OFFER.TAG.LIMIT.001-R7/R8)`
- `c70ebba` — `fix: cap tags at 40 characters and 10 items (ADD.OFFER.TAG.LIMIT.001-R7/R8)`

No refactor commit was needed; the implementation is 7 added lines in one file.

## Test guarantees

| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | An overlong detected word becomes a tag of exactly 40 normalized characters | `addOfferTagLimit.test.tsx:caps each automatic tag at 40 normalized characters` | PASS |
| 2 | A prefilled draft with 12 tags and a 50-character tag loads 10 tags, each at most 40 characters | `addOfferTagLimit.test.tsx:caps prefilled draft tags by count and length` | PASS |
| 3 | Submitted payload keeps the 10-tag and 40-character caps | `addOfferTagLimit.test.tsx:never submits more tags than the declared limit` | PASS |

## Coverage and known gaps
- Branch coverage (74.35%) remains below the 80% target repo-wide; this change adds no new branch.
- Truncation behavior for tags was not verified on a device/E2E run.
- The UI keeps the static "Up to 10 tags" hint; no per-tag length hint was added.

## Merge evidence
The RED and GREEN checkpoints are reachable from `HEAD` on `dev`.
