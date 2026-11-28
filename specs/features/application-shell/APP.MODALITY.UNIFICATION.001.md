# Spec: `APP.MODALITY.UNIFICATION.001`

## Metadata
- **Title**: One Sheet System and One Native-Route System
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell (all views)
- **Priority**: High

## Purpose
Reduce every overlay and full-screen presentation to two modality systems — a sheet for focused sub-tasks and a native route for destinations — with one Back dispatch and one focus-return rule.

## Preconditions
- The user is on an authenticated shell on iOS or Android.
- At least one focused sub-task and one full-screen destination are available.

## Trigger
- A focused sub-task opens or closes, a full-screen destination is entered or left, or system Back is invoked.

## Requirements
- `APP.MODALITY.UNIFICATION.001-R1`: The system shall provide exactly two modality systems: a native sheet for a focused sub-task and a native route for a full-screen destination.
- `APP.MODALITY.UNIFICATION.001-R2`: Every focused sub-task — including help, offer detail, comments, search, first-run guidance and image viewing — shall use the sheet system; no such sub-task shall introduce a separate full-screen modal or a second overlay pattern.
- `APP.MODALITY.UNIFICATION.001-R3`: Every full-screen destination — including the immersive offers presentation and stacked views — shall use the native-route system; no destination shall be rendered as a sheet.
- `APP.MODALITY.UNIFICATION.001-R4`: System Back shall be dispatched by one policy: when a sheet is visible it dismisses the topmost sheet through that sheet's normal dismissal path, and only when no sheet is visible does it follow native route navigation.
- `APP.MODALITY.UNIFICATION.001-R5`: One Back invocation shall produce exactly one effect — either one sheet dismissal or one route pop — never both and never neither.
- `APP.MODALITY.UNIFICATION.001-R6`: Dismissing a sheet shall return focus to the control that opened it; when that control is no longer present, focus shall move to a sensible successor in the presenting view.
- `APP.MODALITY.UNIFICATION.001-R7`: A sheet shall observe the same discard guard and confirmation regardless of which sub-task opened it, and no dismissal path shall bypass that guard.
- `APP.MODALITY.UNIFICATION.001-R8`: The platform's edge-swipe or predictive Back preview shall not be suppressed by the single dispatch; the policy shall resolve after the preview completes.
- `APP.MODALITY.UNIFICATION.001-R9`: Brand palette, typography, shapes and copy shall stay unchanged across both modality systems.

## Acceptance Criteria (BDD)
```gherkin
Scenario: A focused sub-task and a destination use their own systems
  Given a focused sub-task and a full-screen destination are available
  When each is opened
  Then the sub-task uses a native sheet
  And the destination uses a native route
  And no third modality pattern is introduced

Scenario: Back dismisses a sheet before it navigates a route
  Given a sheet is open above a native route
  When system Back is invoked
  Then the topmost sheet is dismissed through its normal dismissal path
  And the native route is not popped by the same invocation

Scenario: Back pops a route when no sheet is open
  Given no sheet is visible above a pushed native route
  When system Back is invoked
  Then the native route pops through native navigation
  And no sheet dismissal is attempted

Scenario: One Back invocation has one effect
  Given a sheet and a pushed route are both present
  When system Back is invoked once
  Then exactly one of the sheet dismissal or the route pop occurs

Scenario: Focus returns to the control that opened the sheet
  Given a sheet was opened from a chrome control
  When the sheet is dismissed
  Then focus returns to that control

Scenario: Focus moves to a successor when the opener is gone
  Given a sheet was opened from a control that is no longer present
  When the sheet is dismissed
  Then focus moves to a sensible successor in the presenting view

Scenario: A discard guard applies to every sheet
  Given a sheet has unsaved edits
  When any dismissal path is invoked
  Then the same discard confirmation is shown
  And no data is discarded before confirmation

Scenario: Back preview survives the single dispatch
  Given the platform's predictive Back preview is active
  When system Back is invoked
  Then the platform preview is still shown
  And the sheet dismissal or route pop resolves after the preview

Scenario: Guidance and image viewing use the common sheet system
  Given first-run guidance and an offer image viewer are available
  When each is opened
  Then each uses the common sheet system
  And neither introduces a separate full-screen modal

Scenario: Two stacked sheets dismiss one at a time
  Given two sheets are stacked
  When system Back is invoked once
  Then only the topmost sheet is dismissed
  And the lower sheet remains visible

Scenario: A route changes while a sheet is open
  Given a sheet is open above a native route
  When the route changes to a different destination
  Then the sheet follows the single dismissal path
  And focus is restored under the same rule
```

## Example Inputs/Outputs
- Example input: a help sheet is open above the Offers route and system Back is invoked.
- Expected output: the help sheet closes through its normal path, the Offers route stays visible, and focus returns to the help control.
- Example input: no sheet is open on a pushed destination and system Back is invoked.
- Expected output: the destination pops through native navigation and no sheet dismissal occurs.
- Example input: first-run guidance is triggered on first launch.
- Expected output: guidance opens as a sheet with the shared dismissal and focus-return behavior.

## Edge Cases
- Two sheets stacked; one Back invocation dismisses only the topmost.
- The control that opened a sheet is removed before dismissal; focus falls to a sensible successor.
- A route changes while a sheet is open; dismissal and focus return still follow the single policy.
- Predictive Back is started while a discard confirmation is armed; the preview is not suppressed.
- A platform without a native route stack still presents focused sub-tasks as sheets.

## Non-Functional Constraints
- One dismissal policy and one focus-return rule shall be shared by every surface; no surface introduces its own variant.
- Brand visuals shall not change between the two systems.

## Related Specs
- `APP.POLISH.UX.001`
- `APP.PLATFORM.CHROME.001`
- `APP.BOTTOM_SHEET.001`
- `APP.ONBOARD.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `APP.SHELL.002`
- `OFFERS.SEARCH.KEYBOARD.001`
