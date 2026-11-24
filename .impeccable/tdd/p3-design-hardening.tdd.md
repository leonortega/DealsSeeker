# TDD evidence — P3 design-system hardening / polish

- **Date**: 2026-11-24
- **Specs**: `APP.ACCESSIBILITY.UX.001` R7/R8 (Approved) + BDD scenarios added before code
- **Critique**: `.impeccable/critique/2026-11-24T04-59-19Z__actnative-src-navigation-appnavigator-tsx-286c1edc.md` (native Assessment A, 27/40)
- **Device evidence**: `.impeccable/audit/device-p3/` (gitignored captures 01–10)

## Device verification performed

| Check | Result | Evidence |
|---|---|---|
| Light palette | Brand paper/forest/terracotta intact | `02-light-account.png` |
| Dark palette | Night footer fixed, palette complete | `01-baseline.png` |
| font_scale 1.3 | No clipped fields; footer needed a fix (below) | `03-fontscale-1.3.png` |
| Reduce Motion (animations off via `settings put global ..._scale 0`) | Navigation worked, brand UI unchanged | `05-reduce-motion.png` |
| TalkBack enabled | Labels exposed, app stable; disabled after | `06-talkback.png` |
| Landscape | App is portrait-locked in `app.json` — not applicable | `04-landscape.png` |
| iOS simulation | Waived: requires macOS/Xcode (no Mac available) | decision recorded in plan |
| Maestro E2E | Still blocked: `Maestro Android driver did not start up in time`; emulator reboot declined | attempt logged |

All device settings were restored (font_scale 1.0, animations 1, TalkBack off, portrait).

## RED → GREEN

| Stage | Command | Result |
|---|---|---|
| RED | `npm test -- controlSizes.test.tsx` | 2 failures: footer label `numberOfLines=2`; Offers scroll padding 24 (< 88). |
| GREEN | `npm test` | 56 suites / 336 tests pass. |
| GREEN | `npm run typecheck` | clean. |
| GREEN | `npm run test:arch` | clean (57 files, 72 modules). |
| Coverage | `npm run test:coverage` | 81.95% statements / 81.74% lines — gate held. |

## Guarantee table

| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | Default footer labels are single-line and ≥11 units | `controlSizes.test.tsx` — "keeps default footer labels on a single line" | PASS |
| 2 | Offers reserves scroll space for the FAB | `controlSizes.test.tsx` — "reserves scroll space for the floating action..." | PASS |
| 3 | Footer 8-unit separation and 44-unit targets unchanged | existing `controlSizes.test.tsx` cases | PASS |
| 4 | Night footer palette fixed across themes | existing "keeps the night footer palette fixed..." | PASS |

## Implementation notes

- `AppFooterBar`: `numberOfLines={1}` plus `maxFontSizeMultiplier={1}` and `-0.4` letter spacing. The first attempt (single line alone) truncated "Suggestions" at 1.3 scale; device capture `07` caught it, and `09` verified the final fix renders both default labels in full at 1.3.
- FAB clearance: bottom scroll padding raised from 24 to 180 (+ insets) on Offers, Reports, Suggestions, Favorites and Account. Capture `10` confirms the FAB no longer covers Search or Favorites at the bottom of the Offers scroll. The first 88/120 attempts were insufficient and were corrected from device evidence.
- `DESIGN.md`: `soft-shadow` frontmatter corrected `0.14 → 0.18` (per user decision), and three stale web references rewritten to mobile-only wording.

## Coverage and gaps

- Maestro E2E could not run (driver startup timeout); verification used direct device tools instead.
- iOS visual parity remains waived (no macOS/Xcode).
- "Nearby offers" heading looks pale in dark captures; it appears during a transition and was not reproduced as a settled state — logged as a minor observation, not fixed.
- Repo-wide branch coverage remains 73.98%; statements/functions/lines are above 80%.
