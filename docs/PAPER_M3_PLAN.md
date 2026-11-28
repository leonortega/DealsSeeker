# Plan — Material 3 via React Native Paper + Google Design MCP (Android phase)

## Inputs gathered
- Requested site: https://reactnativepaper.com/ — Paper 5.15.5, Material You/M3, needs `PaperProvider`; Expo already provides icon fonts; `react-native-safe-area-context` is already installed.
- Design MCP endpoint `https://design.googleapis.com/mcp` used for:
  - `generate_color_scheme` from each brand primary (`#b0512c` golden, `#e8a13a` market, `#ce4719` tangerine), light and dark, TONAL_SPOT, standard contrast — full M3 role maps.
  - `search_icons` → Material Symbols names used by the app: `near_me`, `explore`, `my_location`, `directions`, `favorite`, `report`, `chat`, `add`, `search`, `help`, `thumb_up`, `event_available`.
  - `icons_instructions` → prefer Material Symbols, look names up by keyword, avoid duplicate icons per screen.
  - `describe_font`/`search_fonts` → Roboto Serif (variable, weights 100–900, opsz 8–144) as the open-source landmark serif candidate for Android, replacing the generic `serif` fallback while Georgia remains on iOS.

## Dependency
- `npm install react-native-paper@5.15.5` (peer deps are wildcards; Expo already includes vector icons).
- Add the production-only babel plugin `react-native-paper/babel` for bundle size.

## Theme bridge
- Extend `utils/theme.ts` with `resolvePaperTheme(themeMode, themeWorld, systemScheme)` mapping each MCP scheme's roles to Paper MD3 theme colors (`primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`, `secondary`, `tertiary`, `surface`, `onSurface`, `surfaceContainer`, `outline`, `error`) while keeping the authored night-footer surface and immersive overlay ink.
- Wrap the app root in `PaperProvider theme={paperTheme}`.

## View migration (all views)
| Surface | Paper components |
|---|---|
| App shell | `Appbar.Header/Content/Action`, `IconButton`, navigation bar styling, `Snackbar` for the unified status surface |
| Offers standard | `Searchbar`, `Chip`, `Button`, `Card`, `Badge`, `FAB`, `RadioButton.Group` for coverage, `ProgressBar` for pending |
| Offers immersive | keep the authored full-screen composition; swap glyphs to Material Symbols names from MCP, `IconButton` for rail, `Snackbar` for feedback |
| Add Offer | `TextInput` (labelled/helper/error), `HelperText`, `Button`, `SegmentedButtons`/step indicator, `Checkbox`, `Dialog` for discard/recovery |
| Account | `List.Section/Item`, `Switch`, `RadioButton.Group`, `Avatar.Text/Icon`, `Divider`, `Surface` |
| Login / Register | `TextInput`, `Button`, `HelperText`, `Snackbar`, `Appbar` |
| Favorites / Suggestions | `Card`, `List.Item`, `Button`, `Snackbar`, `TextInput` |
| Sheets / dialogs | `Modal`/`Portal`, `Dialog`, `Snackbar`, keeping the single sheet modality |

## Guardrails
- Spec-first: amend DESIGN.md, `APP.PLATFORM.CHROME.001`, `APP.THEME.001`, `APP.TYPOGRAPHY.001`, `APP.FEEDBACK.001`, component specs and BDD before code; approve, then implement TDD.
- Keep product behavior, copy, coordinate privacy, accessibility labels and verify on Android emulator (`emulator-5554`); no emulator/server restart.
- Keep the Trail Map identity: one waypoint accent, night footer, Georgia/Roboto Serif landmarks, pills, one ambient shadow.

## Verification
- `npm test -- --runInBand`, `npm run typecheck`, `npm run test:arch`, Android screenshot/UI-hierarchy pass, then a fresh Impeccable critique/audit.
