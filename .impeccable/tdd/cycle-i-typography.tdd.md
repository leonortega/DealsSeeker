# TDD evidence — Cycle I: cross-platform landmark typography (`APP.TYPOGRAPHY.001`)

## Source
- Plan: `UIUX_IMPROVEMENT_PLAN.md` §10.5 (Cycle I).
- Spec: new approved `APP.TYPOGRAPHY.001` v1.0 with BDD `app-typography.feature`, traceability row, and bidirectional links in `APP.BRAND.001`, `APP.SHELL.002`, `APP.ACCESSIBILITY.UX.001`.
- No contracts/examples: typography is visual, with no data shape.

## User journeys
- As a user on either platform, I want brand landmarks to render as serif so the design world reads the same.
- As a user on Android, I want the headline face to actually be serif instead of silently falling back to sans.

## RED / GREEN
- RED: `npm test -- landmarkTypography.test.ts` → suite failed to run: `Cannot find module .../src/utils/typography`. Compile-time RED for the missing helper.
- GREEN: same command → 1 suite / 3 tests passed.
- Full unit suite: `npm test` → 68 suites / 408 tests passed; `npm run typecheck` clean.
- Encoding incident: the first bulk edit wrote 13 files with the wrong encoding, corrupting non-ASCII glyphs (`›`, `▤`, emoji) and failing 3 tests. Those files were restored from the RED checkpoint and rewritten with explicit UTF-8; the affected suite then passed. No content loss.

## What the tests guarantee
| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | iOS uses the authored Georgia face | `landmarkTypography.test.ts:uses the authored face on iOS` | unit | PASS |
| 2 | Android uses an equivalent platform serif | `landmarkTypography.test.ts:uses an equivalent platform serif on Android` | unit | PASS |
| 3 | No component style hardcodes `fontFamily: 'Georgia'` | `landmarkTypography.test.ts:has no inline Georgia literals…` | static guard | PASS |
| 4 | Pre-existing glyph/copy assertions still hold | `accountAndOfferCard.test.tsx` | unit | PASS |

## Implementation
- `src/utils/typography.ts` exports `landmarkFontFamily(platform = Platform.OS)`: `Georgia` on iOS/web, `serif` on Android.
- 17 style sites across 13 components/screens now call `landmarkFontFamily()`.
- Immersive business name and top-bar title gained the landmark family (weight normalized to 700 per DESIGN.md).
- No font asset or new dependency added.

## Checkpoint commits (on `dev`)
1. `f50580b` — `test: add RED reproducer for cross-platform landmark typography`.
2. `2273f7e` — `fix: render landmark typography as serif on both platforms`.
3. Evidence report commit follows.

## Known gaps
- No bundled font file: Android uses the platform serif family, which is visually equivalent but not the identical Georgia typeface. `APP.SHELL.002-R9` visual-parity requirement is interpreted as same intent/hierarchy, not identical font binaries.
- Device E2E not run at the user's request. A visual capture of serif rendering on the Android emulator is still outstanding.
- Cycle H's manual 150%-text visual check remains outstanding for the same reasons.
