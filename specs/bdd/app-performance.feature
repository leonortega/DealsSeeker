Feature: Responsive startup, rendering and bounded-cache performance with evidence
  As a deal hunter on an Android phone
  I want the app to respond when it is actually ready and stay smooth
  So that I am not held up by arbitrary waits, jank or unbounded caching

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
    And a usable degraded surface is shown

  Scenario: Transient state does not re-render unchanged offer rows
    Given an offer list is displayed with memoized rows
    When a press or selection state changes on one row
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
