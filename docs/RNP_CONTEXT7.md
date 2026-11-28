# React Native Paper API reference (via Context7, 2026-11-27)

Source: Context7 library `/websites/oss_callstack_react-native-paper` (React Native Paper 5.x).

## Component equivalents
- Icon-only action → `IconButton` (extends `TouchableRipple` props; `icon` is `IconSource`, `iconColor`, `selected`, `size`, `onPress`, `accessibilityLabel`, `testID`).
- Labelled action → `Button` (modes: text/contained/contained-tonal/outlined/elevated); supports `icon`, `loading`, `disabled`, `accessibilityLabel`.
- Custom ripple/pressable → `TouchableRipple`.
- Body/labels/headings → `Text` with 15 MD3 variants (`displayLarge`…`labelSmall`); default variant applies when omitted; accepts `style`.
- Text entry → `TextInput` with `label`, `mode`, helper/error via `HelperText`.
- Confirmation/alert → `Dialog` + `Dialog.Title/Content/Actions` inside `Portal`.
- Transient status → `Snackbar` (temporary or persistent until action).
- Loading → `ActivityIndicator`.
- Dividers, avatars, badges, chips, cards → `Divider`, `Avatar.Text/Icon/Image`, `Badge`, `Chip`, `Card` (+ `Card.Title/Content/Actions/Cover`).
- Progress → `ProgressBar` (`progress`, `indeterminate`, `color`).
- Primary action → `FAB` (`icon="plus"`, `onPress`, `style`).

## Navigation
- App bar → `Appbar.Header` + `Appbar.Content` + `Appbar.Action`/`BackAction`.
- Bottom navigation → `BottomNavigation.Bar`: wire `navigationState={state}`, `safeAreaInsets={insets}`, `onTabPress` with `CommonActions.navigate`, `renderIcon` from descriptors' `tabBarIcon`, `getLabelText` from `tabBarLabel`/`title`/route name. Use as `tabBar` prop of `Tab.Navigator`.
- Replace the default tab bar this way instead of hand-building a bar with `Pressable`.

## Theming
- `PaperProvider theme={theme}` where `theme = { ...MD3LightTheme, roundness, colors: { ...MD3LightTheme.colors, ...roles } }`.
- `useTheme()` reads the active theme; typed custom properties via `export type AppTheme = typeof theme; export const useAppTheme = () => useTheme<AppTheme>()`.
- The project already builds its theme via `resolvePaperTheme` in `utils/theme.ts`; prefer `useTheme()` over raw palette colors.

## Additional APIs verified in the second replacement loop (2026-11-28)
- `Switch`: `value` + `onValueChange`, `disabled`, `color`, `theme`.
- `Checkbox`: `status` (`'checked' | 'unchecked' | 'indeterminate'`) + `onPress`.
- `Chip`: `mode` (`flat`/`outlined`), `selected`, `selectedColor`, `showSelectedCheck`, `showSelectedOverlay`, `icon`/`avatar`, `onClose`.
- `Divider`: no required props; use between rows instead of a styled 1px view.
- `Snackbar`: `visible`, `onDismiss`, `action={{ label, onPress }}`, `duration`, `icon`/`onIconPress`.
- `Dialog`: `Portal` + `Dialog.Title` / `Dialog.Content` / `Dialog.Actions` with `Button`s.
- `ProgressBar`: `progress` (0–1) or `indeterminate`, `color`.
- `Searchbar`: `value`, `onChangeText`, `placeholder`, `loading`, `inputStyle`, `testID`.
- `HelperText`: `type="error" | "info"`, `visible`, placed under a Paper `TextInput`.

## Guardrails
- Keep existing testIDs, accessibility labels/roles/states, touch floors and behavior when substituting components.
- Prefer direct RNP equivalents over bespoke visuals; no second icon vocabulary (use the verified Material symbols from `PlatformTabIcon` / `MATERIAL_SYMBOL_ICONS`).
