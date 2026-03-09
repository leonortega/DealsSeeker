# Spec: `APP.LOCALIZATION.001`

## Metadata
- **Title**: Application Localization and Language Selection
- **Version**: `v0.3`
- **Status**: Draft
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Provide multi-language UI and dictionary behavior with system-locale defaults.

## Preconditions
- Application shell is available.

## Trigger
- App startup or user language change from menu/settings controls.

## Requirements
- `APP.LOCALIZATION.001-R0`: The system shall support at least `English` and `Spanish` as selectable app languages.
- `APP.LOCALIZATION.001-R1`: The default value of the app language shall be the device/system language (locale).
- `APP.LOCALIZATION.001-R2`: The user shall be able to manually change app language in settings.
- `APP.LOCALIZATION.001-R3`: All user-facing UI strings shall be externalized into localization resource files.
- `APP.LOCALIZATION.001-R4`: Fuzzy/synonym dictionaries used by `OFFERS.SEARCH.SMART.001` and `ADD.OFFER.TAGS.SUGGESTIONS.001` shall load by selected language.
- `APP.LOCALIZATION.001-R5`: Missing translation keys shall fall back to a configured default language.
- `APP.LOCALIZATION.001-R6`: Missing language dictionaries for smart matching/suggestions shall fall back without blocking feature usage.
- `APP.LOCALIZATION.001-R7`: The main navigation menu shall include a language-change control.
- `APP.LOCALIZATION.001-R8`: When the user changes language from the menu control, UI strings and language-dependent dictionaries shall update instantly in the current view without requiring app restart.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Default language value is the system language
  Given no manual language override exists
  And device locale is set to Spanish
  When the app starts
  Then app language shall initialize to Spanish

Scenario: User changes language from settings
  Given the app is currently in English
  When the user selects Spanish in settings
  Then UI strings shall be rendered from Spanish localization resources
  And search/tag dictionaries shall switch to Spanish resources

Scenario: User changes language from menu control
  Given the app is currently in English
  When the user selects Spanish from the menu language control
  Then visible UI strings in the current view shall update to Spanish immediately
  And search/tag dictionaries shall switch to Spanish resources immediately

Scenario: Missing translation key falls back
  Given selected language resources are missing a UI key
  When that UI element is rendered
  Then the system shall show the fallback language string
```

## Example Inputs/Outputs
- Example input: System locale `es-AR`, no override.
- Expected output: App UI defaults to Spanish resources.

## Edge Cases
- Unsupported system locale falls back to default supported language.
- Language change during active search re-runs dictionary loading for selected language.

## Non-Functional Constraints
- Language switching should complete without app restart when supported by runtime.

## Related Specs
- `APP.SHELL.001`
- `OFFERS.SEARCH.SMART.001`
- `ADD.OFFER.TAGS.SUGGESTIONS.001`
