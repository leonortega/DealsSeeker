# Spec: `APP.PERFORMANCE.PROFILE.001`

## Metadata
- **Title**: Measured Performance Profile and Evidence Record
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Application Shell (performance verification across startup, feed and cache)
- **Priority**: High

## Purpose
Define the measurable performance profile — budgets for startup, scroll smoothness, bundle size and image cache — and the conditions under which evidence is captured, so that performance claims are repeatable and comparable across the Android phase.

## Preconditions
- The app is built for Android and installed on a device representing a target class.
- A representative offer dataset and image set are available.

## Trigger
- A performance profile is established, a measurement pass is run, or a build is reviewed against its budgets.

## Requirements
- `APP.PERFORMANCE.PROFILE.001-R1`: The system shall define explicit budgets for time to first interactive frame, sustained scroll frame rate at the device refresh rate, shipped bundle size, and image cache capacity; each budget shall be recorded with the profile.
- `APP.PERFORMANCE.PROFILE.001-R2`: Startup measurement shall capture the interval from process start to the first interactive frame on a representative device, and the result shall be recorded as evidence, as defined by `APP.PERFORMANCE.001`.
- `APP.PERFORMANCE.PROFILE.001-R3`: Scroll measurement shall use a representative feed dataset and shall record sustained frame rate and dropped frames during a repeatable scroll, as defined by `APP.PERFORMANCE.001`.
- `APP.PERFORMANCE.PROFILE.001-R4`: Bundle analysis shall record the shipped size against the budget and keep a comparable baseline so growth is visible.
- `APP.PERFORMANCE.PROFILE.001-R5`: Image cache verification shall record observed capacity and eviction under a repeatable rapid-viewing sequence, as defined by `APP.PERFORMANCE.001`.
- `APP.PERFORMANCE.PROFILE.001-R6`: Every measurement shall record its conditions — device class, appearance, font scale, refresh rate and dataset — so that a pass can be repeated and compared.
- `APP.PERFORMANCE.PROFILE.001-R7`: A result outside any defined budget shall be recorded as a regression and shall block a full performance score claim until it is reconciled with the profile.
- `APP.PERFORMANCE.PROFILE.001-R8`: Gesture, refresh-rate and smoothness evidence shall come from a physical device where one is available; emulator results shall be labelled as breadth-only and shall not be the sole basis for a smoothness claim.
- `APP.PERFORMANCE.PROFILE.001-R9`: Verification evidence shall be retained with the build it measures, so that a claim can be traced back to the exact measured result.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Budgets are defined before measurement
  Given a performance profile is being established
  When the profile is recorded
  Then it defines budgets for startup, scroll frame rate, bundle size and image cache capacity
  And each budget is stated with its measurement condition

Scenario: Startup is measured to first interactive frame
  Given a representative Android device and a built app
  When the app is launched and measured from process start to first interactive frame
  Then the measured time is within the startup budget
  And the result and conditions are recorded

Scenario: Scroll smoothness is measured with a repeatable dataset
  Given a representative feed dataset and a device
  When a repeatable scroll is performed
  Then sustained frame rate meets the budget at the device refresh rate
  And dropped frames are recorded with the result

Scenario: Bundle size is tracked against a baseline
  Given a shipped build and a recorded baseline
  When the bundle is analyzed
  Then its size is within the bundle budget
  And the comparison with the baseline is recorded

Scenario: Image cache capacity is verified under rapid viewing
  Given a repeatable rapid-viewing sequence of many images
  When the cache is inspected during and after the sequence
  Then it never exceeds the cache budget
  And eviction is observed and recorded

Scenario: Measurement conditions are recorded
  Given a measurement pass is run
  When its evidence is stored
  Then device class, appearance, font scale, refresh rate and dataset are recorded
  And the pass can be repeated under the same conditions

Scenario: A regression beyond budget blocks a score claim
  Given a measured result exceeds a defined budget
  When the build is reviewed for a performance claim
  Then the result is recorded as a regression
  And a full performance score claim is withheld until reconciliation

Scenario: Device evidence is distinguished from emulator breadth
  Given performance evidence from an emulator and from a physical device exists
  When a smoothness claim is made
  Then the physical-device evidence is used for the claim
  And the emulator evidence is labelled as breadth-only
```

## Example Inputs/Outputs
- Example input: a launch measured at 1.1 seconds to first interactive frame against a 1.0 second budget.
- Expected output: recorded as a regression; the performance claim is withheld pending reconciliation.
- Example input: a 90 Hz device with a recorded scroll pass.
- Expected output: sustained frame rate near 90 Hz with dropped frames recorded and the device class noted.
- Example input: a cache budget of fifty entries under a hundred-image viewing sequence.
- Expected output: cache never exceeds fifty entries, eviction observed, result recorded with conditions.

## Edge Cases
- The slowest supported device class is unavailable; evidence is labelled with the class actually measured.
- A measurement is taken in the dark appearance at 200 percent font scale.
- The bundle grows between builds with no baseline recorded.
- A rapid-viewing sequence is interrupted by connectivity failure.
- Only emulator evidence exists for a gesture claim.

## Non-Functional Constraints
- The profile defines observable measurements and evidence, not the mechanism used to achieve them.
- Raw coordinate values shall not appear in performance evidence tied to offer-facing surfaces.

## Related Specs
- `APP.POLISH.UX.001`
- `APP.TYPOGRAPHY.001`
- `APP.PERFORMANCE.001`
