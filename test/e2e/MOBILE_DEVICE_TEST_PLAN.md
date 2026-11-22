# Mobile Device Test Plan (Android / mobile-mcp)

## 1. Objective
Verify the native Android client against every Approved BDD feature on a real emulator, producing evidence mapped to spec IDs. This complements Jest unit tests and the Playwright web E2E suite.

## 2. Environment
- Device: `DealsSeekerApi` (AVD, Android 15, emulator-5554), connected through mobile-mcp.
- API: `http://localhost:5005` (health: `/health/live`); Metro: `http://localhost:8081`.
- App: `com.anonymous.dealsseekerreactnative`, Expo development build.
- Primary tool: `mobile_list_elements_on_screen` (deterministic assertions from the accessibility hierarchy).
- Sequence tool: `mobile_batch_commands` (tap/type/swipe/press/delay grouped into one round-trip).
- Visual tool: `mobile_take_screenshot` / `mobile_save_screenshot` only for visual judgment.
- Diagnostics: `mobile_get_device_logs`, `mobile_list_crashes`, `mobile_get_foreground_app`.
- State tools: `mobile_clear_app_data`, `mobile_set_location`, `mobile_set_orientation`, `mobile_press_button`.

## 3. Test data strategy
- Register a fresh user per run through the API (`POST /api/auth/register` with `displayName`, `email`, `password`) and log in through the UI.
- Seed offers through the authenticated API so search, detail, favorites, and reports have deterministic data.
- Reset between scenario groups with `mobile_clear_app_data` + relaunch.
- Use `mobile_set_location` for deterministic GPS; grant the location permission through the system dialog.
- Reuse the pre-existing account only for edit/delete scenarios, or clone its offers into the test account.

## 4. Execution phases

| Phase | Scope | Exit condition |
|---|---|---|
| 0. Smoke | Launch, auth, Offers, Add Offer create, submit, success | Critical path works; otherwise stop |
| 1. Shell | Tabs, FAB, active states, Back/Cancel, Help, onboarding, theme, language, navigation mode, session persistence | `app-shell`, `app-help`, `app-onboarding`, `app-theme`, `app-localization`, `app-navigation-mode` covered |
| 2. Offers | Feed/Map/Grid switch and persistence, search (exact/fuzzy/synonyms/empty/pagination), filters, detail modal, photos carousel, favorites, votes, reports prefill, promoted/reported, image fallback, immersive feed/back | All `offers-*` features covered |
| 3. Add Offer | GPS auto-populate and reverse label, typeahead, map pin and center pin, confirm/edit toggle, image capture/gallery/reorder, auto-tags and suggestions, validation, success dwell/redirect, edit prefill/save, exit/Back confirmation, bounds, keyboard, tablet composition | All `add-offer-*` features covered |
| 4. Account | Profile, avatar persistence, owned offers, edit, delete confirmation | `account-*` covered |
| 5. Suggestions & Reports | Submit, validation, success, offer prefill | `suggestions-submit`, `reports-*` covered |
| 6. Adaptive & resilience | Portrait/landscape, tablet width via `wm size` override and restore, dark theme, large text via `font_scale`, fallback location, offline/API failure | `app-adaptive-*`, `app-resilience-ux`, `app-location-*`, `app-api-connectivity`, `app-rate-limit` covered |
| 7. Accessibility | Labels, 44pt targets, live regions, tap-by-ref; VoiceOver/TalkBack structural only | `app-accessibility-*`, `app-announced-feedback` covered |

## 5. Per-scenario template
```
Given <spec ID> <requirement>
When  <user action>
Then  <observable result>

MCP steps:
  mobile_list_elements_on_screen            -> refs and current text
  mobile_batch_commands [click/type/press]  -> perform the action
  mobile_list_elements_on_screen            -> assert resulting text/states
Evidence: spec ID, device state, observed hierarchy, screenshot (if visual), verdict
```

## 6. Evidence and reporting
- Write results to `test-results/mobile/<date>.md`: spec ID, scenario, device state, observed text, screenshot path, logs, PASS/FAIL.
- Use hierarchy text as the deterministic assertion; screenshots only for theme, carousel, map, and tablet columns.
- File every failure with repro steps and a spec link; re-run the affected group after fixes.

## 7. Known limits (record, do not pretend)
- Native network fault injection is unavailable through MCP: cover 429/500/offline with Playwright or by temporarily stopping the API.
- VoiceOver/TalkBack and real camera/gallery media need manual or physical-device confirmation; emulator camera can be seeded via adb.
- Tablet layout uses `wm size` / `wm density` overrides; always restore afterward.
- Web stays phone-first by design; no wide web reflow is expected.

## 8. Exit criteria
- All P0/P1 scenarios pass in both themes and EN/ES on phone.
- Tablet-specific scenarios pass at >=720 dp.
- `mobile_list_crashes` reports no new crashes.
- Every failure has a spec-linked report.
