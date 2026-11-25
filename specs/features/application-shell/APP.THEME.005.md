# Spec: `APP.THEME.005`

## Metadata
- **Title**: Tangerine & Mint Themes with Account Selection
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: My Account, all views
- **Priority**: High

## Purpose
Give users an explicit theme choice in My Account and apply the clean warm-light and cozy high-contrast-dark palettes across the app.

## Preconditions
- The user is authenticated and on My Account.

## Trigger
- The user selects a theme option, or any themed surface is rendered.

## Requirements
- `APP.THEME.005-R1`: My Account shall provide an explicit theme selector with System, Light and Dark options, with the active option shown as selected.
- `APP.THEME.005-R2`: The light theme shall use warm alabaster `#FAF8F5`, white cards, tangerine brand fill, mint savings badges, and near-black primary text.
- `APP.THEME.005-R3`: The dark theme shall use deep slate `#121417`, slate cards `#1E2228`, coral-peach brand fill, bright mint savings badges, and warm off-white text.
- `APP.THEME.005-R4`: Brand buttons in light theme shall use `#CE4719` so white label text reaches at least 4.5:1; the requested `#D94E1F` is reserved for large brand display only.
- `APP.THEME.005-R5`: Savings and promoted badges shall use mint with dark-ink text in dark theme and white text in light theme.
- `APP.THEME.005-R6`: Deal status shall never be conveyed by color alone; every status badge shall include a text label, and an icon where one already exists.
- `APP.THEME.005-R7`: Primary offer controls shall have touch targets of at least 48x48 units with at least 8 units between adjacent controls.
- `APP.THEME.005-R8`: A copied promo code state shall announce success to assistive technology where that control exists; no such control is introduced by this spec.
- `APP.THEME.005-R9`: Theme changes shall apply immediately without restarting the app and shall persist across launches.
- `APP.THEME.005-R10`: The selector shall be operable with assistive technology and expose the active option.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Choosing a theme in My Account
  Given the user is on My Account
  When the user selects the Dark theme option
  Then the dark palette applies immediately
  And the Dark option is marked as selected
  And the preference persists after relaunch

Scenario: Deal status is not color-only
  Given an offer is promoted or reported
  When its card is rendered
  Then a text label accompanies the status color
  And the text remains readable in both themes

Scenario: Offer controls have safe touch targets
  Given the Offers view is displayed
  When the user views radius chips and primary action buttons
  Then each target is at least 48x48 units
  And adjacent controls are separated by at least 8 units
```

## Example Inputs/Outputs
- Example input: select Dark in the account theme selector.
- Expected output: slate surfaces, coral brand buttons with dark text, mint savings badges with dark text.

## Edge Cases
- System theme with either OS appearance.
- Long localized theme labels.
- Large text scaling on the selector.
- Offers with both promoted and reported marks.

## Non-Functional Constraints
- No new dependency shall be added for the selector or palettes.

## Related Specs
- `APP.THEME.001`
- `APP.THEME.004`
- `ACCOUNT.PROFILE.001`
- `APP.ACCESSIBILITY.UX.001`
