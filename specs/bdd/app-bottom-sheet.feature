Feature: Native bottom-sheet behavior for overlays
  As a user opening an overlay
  So that it behaves like a natural sheet without changing the DealsSeeker look

  Scenario: Overlay opens as a native sheet
    Given the user opens an overlay surface
    When the sheet is rendered
    Then it rests at a defined snap point
    And its content keeps the existing brand styling

  Scenario: Swipe-down dismisses an overlay
    Given an overlay sheet is open
    When the user drags it down past the dismissal point
    Then the overlay closes through its normal dismissal path

  Scenario: Swipe-down cannot bypass a discard guard
    Given an overlay with unsaved edits is open
    When the user swipes the sheet down
    Then the existing discard confirmation is shown
    And no data is discarded silently

  Scenario: Sheet behavior does not change outcomes
    Given an overlay sheet is open
    When the user completes its primary action
    Then validation, submission and navigation behave as before

  Scenario: Platform without sheet support
    Given the platform cannot provide native sheet behavior
    When an overlay is opened
    Then its existing close control still works
