# Spec: `APP.SHELL.004`

## Metadata
- **Title**: System Back Semantics via Native Navigation
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell
- **Priority**: High

## Purpose
Define that system Back (Android button and predictive gesture, iOS edge swipe) is handled by native navigation behavior while preserving all existing view-level safeguards and without adding a visible back control.

## Preconditions
- The application runs on iOS or Android.
- Native navigation containers are in place per `APP.SHELL.002`.

## Trigger
- The user invokes the platform back gesture or back button.

## Requirements
- `APP.SHELL.004-R1`: In-app Back navigation shall be handled through native navigation lifecycle handlers rather than a custom global back stack; a root-level handler may intercept Back only to request exit confirmation when Offers is the active view.
- `APP.SHELL.004-R2`: On Add Offer with unsaved edits, system Back shall follow the cancel and discard-confirmation behavior defined in `ADD.OFFER.EXIT.001`.
- `APP.SHELL.004-R3`: When a destination was opened from the immersive offers feed, system Back shall return to the immersive feed as defined in `OFFERS.IMMERSIVE.001`.
- `APP.SHELL.004-R4`: When Offers is the active view with no open overlay, system Back shall request exit confirmation and shall leave the application only after confirmation, per `APP.SHELL.001-R18`.
- `APP.SHELL.004-R5`: System Back shall preserve destination view state as required by `APP.SHELL.001-R19`.
- `APP.SHELL.004-R6`: No visible in-app back control shall be introduced; navigation controls shall remain as defined in `APP.SHELL.001-R24`.
- `APP.SHELL.004-R7`: Back handling shall be equivalent for Android system Back / predictive Back and iOS left-edge swipe, differing only where the platform itself differs.
- `APP.SHELL.004-R8`: A Back invocation during an in-progress transition, navigation or save shall be resolved deterministically and shall not be handled twice.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Back from Offers asks for exit confirmation
  Given the user is on Offers with no open overlay
  When the user invokes system Back
  Then an exit confirmation shall be shown
  And the application shall remain open until the user confirms

Scenario: Back closes an open overlay before the exit confirmation
  Given an overlay is open on Offers
  When the user invokes system Back
  Then the overlay shall close
  And no exit confirmation shall be shown

Scenario: Back returns to Offers from another view
  Given the user moved from Offers to Suggestions
  When the user invokes system Back
  Then Offers shall become visible with its search query and radius preserved
  And the application shall remain open

Scenario: Back from the immersive feed destination
  Given the user opened My Account from the immersive offers feed
  When the user invokes system Back
  Then the immersive offers feed shall become visible again

Scenario: Back from Add Offer with unsaved edits
  Given the Add Offer draft has unsaved edits
  When the user invokes system Back
  Then the discard confirmation shall be shown
  And the draft shall remain until the user confirms

Scenario: Back adds no visible control
  Given the user is on any destination
  When system Back handling is active
  Then no in-app back button or arrow shall be displayed

Scenario: Back during an in-progress save
  Given an Add Offer save request is in progress
  When the user invokes system Back
  Then the request shall resolve before the shell reacts
  And the Back action shall not be applied twice
```

## Example Inputs/Outputs
- Example input: Offers (`coffee`, `1000 m`) → Suggestions → system Back.
- Expected output: Offers shown with `coffee` and `1000 m`; app stays open.
- Example input: Add Offer with edits → system Back.
- Expected output: Discard confirmation; no data lost.

## Edge Cases
- Repeated Back invocations shall walk back through visited views and shall not close the app while an in-app view remains.
- Back invoked on a modal and on its underlying view in quick succession shall not skip a destination.
- On iOS, edge swipe shall be available wherever system Back is expected, unless a child view owns a conflicting horizontal gesture.
- If the OS cancels a Back gesture, no navigation shall occur.

## Non-Functional Constraints
- Back handling shall not depend on a custom global stack that duplicates the native navigation state.
- Gesture conflicts with the photo carousel, map and immersive feed shall be resolved in favor of deterministic navigation.

## Related Specs
- `APP.SHELL.001`
- `APP.SHELL.005`
- `APP.SHELL.002`
- `APP.SHELL.003`
- `ADD.OFFER.EXIT.001`
- `OFFERS.IMMERSIVE.001`
- `APP.LIFECYCLE.001`
- `APP.ACCESSIBILITY.UX.004`
