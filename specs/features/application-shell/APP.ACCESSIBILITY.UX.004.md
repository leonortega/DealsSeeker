# Spec: `APP.ACCESSIBILITY.UX.004`

## Metadata
- **Title**: Screen-Reader Focus on Destination Changes
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell, all destinations and overlay surfaces
- **Priority**: Medium

## Purpose
Ensure that assistive-technology users are told where they are after a navigation or system Back event and that focus lands on the new destination in a deterministic order.

## Preconditions
- The user is on a supported destination with a screen reader enabled.
- A destination change is about to occur through a footer tab, an in-app action, an overlay or system Back.

## Trigger
- A destination is opened, closed or restored by navigation or by the operating system's Back behavior.

## Requirements
- `APP.ACCESSIBILITY.UX.004-R1`: When a destination changes, the system shall announce the destination name in the active language.
- `APP.ACCESSIBILITY.UX.004-R2`: After the announcement, screen-reader focus shall be placed on the new destination's primary heading or container before its controls.
- `APP.ACCESSIBILITY.UX.004-R3`: When system Back restores a previous destination, focus shall be placed on that destination's primary heading or container before its controls.
- `APP.ACCESSIBILITY.UX.004-R4`: Navigation announcements shall contain only user-facing information; internal codes, raw coordinates and off-screen content shall not be exposed.
- `APP.ACCESSIBILITY.UX.004-R5`: These requirements shall hold in both themes, in every supported language and at large text sizes.
- `APP.ACCESSIBILITY.UX.004-R6`: Focus handling shall not change the visual appearance, ordering or behavior of any control.

Dialog focus confinement and return are specified by `APP.ACCESSIBILITY.UX.003`; this spec covers destination changes only.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Switching destinations announces the new destination
  Given a screen reader is enabled on the main shell
  When the user activates a footer destination
  Then the destination name shall be announced in the active language
  And focus shall be placed on the destination's primary heading before its controls

Scenario: System Back restores focus
  Given the user opened a destination from a control on Offers
  When the user invokes system Back
  Then Offers shall become visible
  And focus shall return to the control that opened the destination or an equivalent control

Scenario: Repeated navigation stays deterministic
  Given the user activates the already-selected footer destination
  When the destination is activated again
  Then focus and announcements shall remain deterministic
  And no duplicate announcement shall be produced
```

## Example Inputs/Outputs
- Example input: screen reader on, activate the Reports footer tab from Offers.
- Expected output: "Reports" is announced; focus moves to the Reports heading, then its first control.
- Example input: open Favorites from Offers, then invoke system Back.
- Expected output: Offers returns, "Offers" is announced, and focus lands on the Offers heading or container.

## Edge Cases
- A destination opened from a control that is no longer present when Back is invoked.
- Two destination changes in quick succession shall not leave focus on a stale destination.
- A localized destination name longer than the source text.
- A screen reader is disabled — visual behavior shall be unchanged.
- Large text sizes where the primary heading wraps to multiple lines.

## Non-Functional Constraints
- Announcements shall be brief and shall not repeat on every render.
- No new dependency shall be added solely for focus management.

## Related Specs
- `APP.MODALITY.UNIFICATION.001`
- `APP.ACCESSIBILITY.UX.002`
- `APP.ACCESSIBILITY.UX.003`
- `APP.SHELL.002`
- `APP.SHELL.003`
- `APP.SHELL.004`
- `APP.LIFECYCLE.001`
- `APP.LOCALIZATION.001`
- `APP.THEME.001`
