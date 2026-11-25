# Spec: `ACCOUNT.SETTINGS.AFFORDANCE.001`

## Metadata
- **Title**: Account Settings Affordance and Profile Layout
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: My Account
- **Priority**: Low

## Purpose
Make the account settings controls recognisably interactive and keep the profile email readable.

## Preconditions
- The user is authenticated and on My Account.

## Trigger
- The account profile and settings controls are rendered.

## Requirements
- `ACCOUNT.SETTINGS.AFFORDANCE.001-R1`: Each settings control shall show a visible affordance that it changes a value when activated.
- `ACCOUNT.SETTINGS.AFFORDANCE.001-R2`: The control's accessible label shall announce its current value and that it can be changed.
- `ACCOUNT.SETTINGS.AFFORDANCE.001-R3`: At normal text size the account email shall not break into a stranded fragment; it may wrap to at most two lines at enlarged text sizes.
- `ACCOUNT.SETTINGS.AFFORDANCE.001-R4`: The logout action shall stay on its own line below the email, left-aligned with the profile details.
- `ACCOUNT.SETTINGS.AFFORDANCE.001-R5`: The behavior shall hold in both themes and both supported languages.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Settings controls look interactive
  Given the user is on My Account
  When the settings panel is displayed
  Then each setting control shall show a visible change affordance
  And its accessible name shall include the current value

Scenario: Long email stays readable
  Given the account email is longer than the profile details width
  When the profile is displayed
  Then the email shall not leave a stranded trailing fragment at normal text size
  And the logout action shall remain on its own line
```

## Example Inputs/Outputs
- Example input: email `e2e-1795488203909113@example.com` on a phone-sized screen.
- Expected output: email wraps cleanly to two lines; theme, language and navigation controls each show a chevron.

## Edge Cases
- Localized labels longer than English.
- Large text scaling with a long email.
- Very short display names.

## Non-Functional Constraints
- No new dependency shall be added for the affordance.

## Related Specs
- `ACCOUNT.PROFILE.001`
- `APP.THEME.001`
- `APP.LOCALIZATION.001`
