# Path to 40/40 Design Health and 20/20 Audit Health (Android phase)

PRODUCT.md now records `android` for this phase; `impeccable context` resolves platform `android` and scores against Material 3 / TalkBack / predictive Back only. iOS is explicitly out of scope.

## Design Health 28 → 40
- Visibility 3→4: pending state for every mutation, visible progress for multi-step work.
- Match 2→4: plain-language coverage radius, no machine UTC timestamp in reports, report reason categories, plain account wording.
- Control 3→4: undo for favorite removal in Favorites, escape/cancel at every decision point.
- Consistency 3→4: one canonical label/role/state per action across card, feed, detail and favorites.
- Error Prevention 3→4: inline validation while typing, confirmation before sending a report.
- Recognition 3→4: persistent action labels, recent searches.
- Flexibility 2→4: recent searches, saved radius/filter presets, batch favourite/vote actions.
- Aesthetic 3→4: one status surface, reduced top-bar and form density.
- Error Recovery 3→4: Add Offer draft recovery after backgrounding/relaunch.
- Help 3→4: searchable help plus inline field-level guidance.

## Audit Health 15 → 20
- Accessibility 4: complete labels/roles/states, measured contrast in both appearances, 200% font, TalkBack device sign-off.
- Performance 4: measured startup, scroll fps, bundle analysis, bounded cache evidence.
- Theming 4: screen-by-screen light/dark screenshot audit with zero raw hex.
- Conformance 4: full Material 3 shell, platform symbols, system sheets, predictive Back verified on device.
- Adaptivity 4: tablet rail, landscape layout, foldable posture, 200% font verification.

All behavior changes follow the spec-first BDD flow; each code change is RED → GREEN → refactor. Verification: full Jest and .NET suites, typecheck, Android emulator screenshots and shell dumps, then a fresh Impeccable critique/audit re-score.
