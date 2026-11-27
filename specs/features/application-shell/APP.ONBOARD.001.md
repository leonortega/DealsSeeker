# Spec: `APP.ONBOARD.001`

## Metadata
- **Title**: First run to first value
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application shell, Offers View (immersive presentation)
- **Priority**: Medium

## Purpose
Help a first-time user understand the primary discovery action without a lengthy tutorial, and never repeat that guidance.

## Preconditions
- The user has an authenticated session.
- The app has completed startup and the offers feed is available.

## Trigger
- The Offers view is shown for the first time on this device.

## Requirements
- `APP.ONBOARD.001-R1`: On first launch, the immersive offers feed shall be the default presentation.
- `APP.ONBOARD.001-R2`: First-run guidance shall be brief, optional, and skippable with a single action.
- `APP.ONBOARD.001-R3`: First-run guidance shall not be shown again once it has been completed or skipped.
- `APP.ONBOARD.001-R4`: Guidance shall not block access to the feed after dismissal.
- `APP.ONBOARD.001-R5`: When location permission is denied, the user shall be told what was missed and shall still be able to browse offers.
- `APP.ONBOARD.001-R6`: Guidance shall use the active language and theme and shall be reachable with assistive technology.
- `APP.ONBOARD.001-R7`: Guidance shall use the same sheet system as other focused sub-tasks and shall follow that system's one dismissal path, single Back dispatch and focus-return rule, as defined by `APP.MODALITY.UNIFICATION.001`.

## Acceptance Criteria (BDD)
```gherkin
Scenario: First launch opens the immersive feed with brief guidance
  Given the app is launched for the first time with an authenticated session
  When the first view is displayed
  Then the immersive offers feed is the default presentation
  And brief, skippable guidance is presented

Scenario: Guidance is not repeated for returning users
  Given the user has completed or skipped first-run guidance
  When the app is launched again
  Then first-run guidance is not displayed again

Scenario: Location denial still leads to value
  Given the user denies location permission on first run
  When the Offers view loads
  Then an explanation of what was missed is shown
  And a way to browse without precise location remains available

Scenario: Guidance is dismissible and labelled
  Given first-run guidance is displayed
  When the user activates its dismiss action
  Then the guidance closes
  And the offers feed remains fully usable

Scenario: Guidance uses the common sheet system
  Given first-run guidance is about to be presented
  When the guidance opens
  Then it uses the same sheet system as other focused sub-tasks
  And it follows the one dismissal path, single Back dispatch and focus-return rule of that system
```

## Example Inputs/Outputs
- Example input: first launch, location permission granted.
- Expected output: immersive feed with a short tip and one "Got it" action presented in the common sheet.
- Example input: system Back is invoked while first-run guidance is open.
- Expected output: the guidance sheet is dismissed and focus returns to the control that opened it.

## Edge Cases
- Storage unavailable or unreadable; guidance defaults to not completed.
- Guidance already completed on another session of the same account.
- Large text scaling and localized copy longer than the source text.
- Guidance is triggered while another sheet is already visible; only the topmost sheet is dismissed by one Back invocation.

## Non-Functional Constraints
- Guidance shall not replace or delay the offer results.

## Related Specs
- `APP.HELP.CONTEXTUAL.001`
- `APP.SHELL.001`
- `OFFERS.UX.001`
- `OFFERS.MODE.SWITCH.001`
- `APP.LOCATION.FALLBACK.001`
- `APP.LOCALIZATION.001`
- `APP.MODALITY.UNIFICATION.001`
- `APP.BOTTOM_SHEET.001`
