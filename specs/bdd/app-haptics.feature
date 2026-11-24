Feature: Native haptic feedback for confirmed actions
  As a user acting on offers and contributions
  So that successful actions get a brief tactile confirmation without changing the interface

  Scenario: Successful favorite toggle confirms by touch
    Given the user is authenticated and viewing an offer
    When the favorite toggle succeeds
    Then one brief native haptic confirmation is emitted
    And the visible favorite state updates as defined by its own spec

  Scenario: Successful vote confirms by touch
    Given the user submits an availability vote
    When the vote is registered successfully
    Then one brief native haptic confirmation is emitted
    And the visible status message remains unchanged

  Scenario: Successful contribution confirms by touch
    Given the user submits a valid suggestion or report
    When the submission succeeds
    Then one success haptic is emitted
    And the success message and subsequent navigation remain as specified

  Scenario: Failure produces no haptic
    Given an action fails or fails validation
    When the failure message is shown
    Then no haptic confirmation is emitted

  Scenario: Haptics do not alter the visual system
    Given haptic feedback is available on the device
    When it is emitted
    Then no control, palette, spacing or copy changes

  Scenario: Platform without haptic support
    Given the device does not support haptic feedback
    When a confirmed action completes
    Then the action and its visible feedback complete normally
