Feature: Measured performance profile and evidence record
  As a reviewer of the Android build
  I want explicit performance budgets and repeatable measured evidence
  So that performance claims are comparable, traceable and honest about device class

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
