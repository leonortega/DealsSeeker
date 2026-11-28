# Spec: `APP.PERFORMANCE.001`

## Metadata
- **Title**: Responsive Startup, Rendering and Bounded-Cache Performance with Measured Evidence
- **Version**: `v1.1`
- **Status**: Approved
- **Context/View**: Application Shell (startup, offer rendering and image cache)
- **Priority**: High

## Purpose
Make startup and offer rendering respond to real readiness signals instead of fixed waits, keep rendering and cache growth bounded, and prove startup, scroll smoothness, bundle size and cache limits with measured verification evidence.

## Preconditions
- The app is launching or an offer list, feed or detail surface is rendering.
- Offer data and images may be loaded or still resolving.
- Performance measurement is available on a device representing a target device class.

## Trigger
- The app starts, an offer row renders, a feed is scrolled, or an image is written to or read from the local image cache.

## Requirements
- `APP.PERFORMANCE.001-R1`: The system shall show the first interactive frame when the signals that the shell actually needs are ready; no fixed-duration splash wait shall be required before that frame.
- `APP.PERFORMANCE.001-R2`: Any safety cap around startup shall be short (strictly under one second) and shall apply only when the readiness signals have not resolved; the cap shall not add delay when they have resolved.
- `APP.PERFORMANCE.001-R3`: Fetching the user profile shall not be a precondition for the first render of the shell or the offer feed; profile-dependent controls may settle after that first frame.
- `APP.PERFORMANCE.001-R4`: Transient interface state (such as press, selection or animation state) shall be kept separate from stable offer data and user preferences, so that a change to transient state shall not re-render offer rows whose stable inputs are unchanged.
- `APP.PERFORMANCE.001-R5`: Text-highlight spans for an offer description shall be derived from stable inputs and reused until those inputs change; the span computation shall not be rebuilt on every render.
- `APP.PERFORMANCE.001-R6`: Image cache keys shall be bounded in length and deterministically derived from the image source reference rather than embedding an unbounded raw reference.
- `APP.PERFORMANCE.001-R7`: Image cache growth shall be bounded by an explicit capacity with an eviction policy; cache size shall not grow without limit as new images are viewed.
- `APP.PERFORMANCE.001-R8`: Image cache persistence shall not perform synchronous disk writes on the main interface thread; writes shall be deferred or asynchronous and shall not block rendering or input.
- `APP.PERFORMANCE.001-R9`: Time to the first interactive frame shall be measured on a representative device, checked against a defined budget, and recorded as verification evidence, as defined by `APP.PERFORMANCE.PROFILE.001`.
- `APP.PERFORMANCE.001-R10`: Scroll smoothness of the offer feed shall be measured during a representative scroll, with recorded evidence of sustained frame rate and no visible jank at the device's refresh rate.
- `APP.PERFORMANCE.001-R11`: Bundle size shall be measured and tracked against a defined budget, with evidence that the shipped bundle does not grow without bound.
- `APP.PERFORMANCE.001-R12`: The bounded image cache shall be verified with evidence that capacity and eviction hold under rapid viewing of many images, as defined by `APP.PERFORMANCE.PROFILE.001`.
- `APP.PERFORMANCE.001-R13`: Gesture, refresh-rate and smoothness evidence shall come from a physical device where one is available; emulator captures may provide breadth but shall not be the sole basis for performance claims.

## Acceptance Criteria (BDD)
```gherkin
Scenario: First frame follows actual readiness
  Given the shell has finished the work required for its first frame
  When startup proceeds
  Then the first interactive frame is shown without waiting for a fixed splash duration
  And no two-second delay is imposed before the frame appears

Scenario: Profile fetch does not hold up the first frame
  Given the profile request is still in flight
  When the shell initializes
  Then the offer feed renders its first frame
  And profile-dependent controls settle after that frame without replacing it

Scenario: A short safety cap covers stalled readiness
  Given a readiness signal never resolves
  When startup waits for that signal
  Then the system proceeds after a safety cap strictly under one second
  And the user sees a usable degraded surface rather than a stalled splash

Scenario: Transient state does not re-render unchanged offer rows
  Given an offer list is displayed with memoized rows
  When a transient interface state such as a press or selection changes
  Then rows whose offer data and preferences are unchanged are not re-rendered

Scenario: Highlight spans are reused across renders
  Given an offer description has computed highlight spans
  When the row re-renders with the same description and the same highlight terms
  Then the existing spans are reused
  And the span computation is not rebuilt for that render

Scenario: Image cache keys are bounded
  Given an image source reference is very long
  When the image is cached
  Then the cache key is bounded in length
  And the same source reference always maps to the same key

Scenario: Image cache growth is bounded
  Given the image cache is at its capacity
  When a new image is cached
  Then an eviction policy makes room for it
  And the cache does not exceed its capacity

Scenario: Cache writes do not block the interface
  Given an image needs to be persisted to the cache
  When the cache write occurs
  Then no synchronous disk write happens on the main interface thread
  And rendering and input remain responsive

Scenario: Startup time is measured and recorded
  Given the app is launched on a representative device
  When time to the first interactive frame is measured
  Then it meets the defined startup budget
  And the measurement is recorded as verification evidence

Scenario: Scroll smoothness is measured
  Given the offer feed contains enough rows for a representative scroll
  When the user scrolls the feed on a device
  Then the sustained frame rate meets the smoothness target at the device refresh rate
  And no visible jank is present in the recorded evidence

Scenario: Bundle size is measured and budgeted
  Given the shipped application bundle is analyzed
  When its size is measured
  Then it is within the defined budget
  And the measurement is recorded with a comparable baseline

Scenario: Cache limits are evidenced under rapid viewing
  Given many images are viewed in quick succession
  When the cache is inspected
  Then it never exceeds its capacity
  And eviction is observed in the recorded evidence

Scenario: Performance evidence distinguishes device from emulator
  Given performance evidence is reviewed
  When claims about gestures, refresh rate and smoothness are made
  Then they come from a physical device where one is available
  And emulator evidence is identified as breadth only
```

## Example Inputs/Outputs
- Example input: profile request takes three seconds while shell readiness is immediate.
- Expected output: the offer feed shows its first frame immediately; profile-dependent controls appear when the request completes.
- Example input: user toggles a favorite press state on a list of twenty offers.
- Expected output: only the affected row updates; the other nineteen rows keep their rendered output.
- Example input: cache capacity of fifty images with a fifty-first image viewed.
- Expected output: a bounded key is used and one older entry is evicted; no unbounded cache growth, with recorded evidence.
- Example input: a measured feed scroll on a 90 Hz device.
- Expected output: sustained frame rate near the refresh rate with no visible jank, recorded as evidence.

## Edge Cases
- Connectivity failure makes the profile request fail — the shell still renders usable content.
- Readiness resolves slower than the safety cap — the cap releases startup and content fills in afterwards.
- Very long localized image URLs with query strings.
- Large text sizes and long descriptions increase render cost without reintroducing per-render recomputation.
- Rapid scrolling causes many images to be cached in a short period.
- Measurement device class differs from the slowest supported device class.

## Non-Functional Constraints
- No fixed startup delay shall be introduced as a substitute for readiness detection.
- Main-thread work shall stay bounded so scrolling and input remain responsive.
- This spec defines observable behavior, not the mechanism used to achieve it.
- Raw coordinate values shall not be exposed in any offer-facing surface.

## Related Specs
- `OFFERS.ACTIONS.LABELS.001`
- `OFFERS.LIST.ACTIONS.001`
- `OFFERS.DETAIL.ACTIONS.001`
- `ADD.OFFER.SEQUENCED.001`
- `ADD.OFFER.UX.001`
- `APP.PERFORMANCE.PROFILE.001`
