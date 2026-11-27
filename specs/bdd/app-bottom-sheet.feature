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

  Scenario: A hidden sheet does not open the keyboard
    Given an overlay sheet is mounted but not visible
    When the presenting surface is opened or switched
    Then no on-screen keyboard appears
    And focus remains on the presenting surface

  Scenario: Overlays do not duplicate the native dismissal affordance
    Given an overlay sheet is open
    When the user views its controls
    Then no separate Close button is rendered
    And the native handle and swipe dismissal remain available

  Scenario: Sheet content is not covered by presenting-view chrome
    Given the immersive offers feed is displayed
    And a status banner is visible
    When an overlay sheet opens
    Then the feed's top bar and tabs do not appear above the sheet
    And the status banner does not appear above the sheet
    And all sheet content remains readable

  Scenario: System Back dismisses an open sheet
    Given an overlay sheet is open
    When the user invokes system Back
    Then the sheet closes through its normal dismissal path
    And the underlying view remains unchanged

  Scenario: Sheet controls are not covered by the native bottom navigation
    Given the native bottom navigation is visible on an authenticated view
    When an overlay sheet opens
    Then the footer and its Create action are not displayed above the sheet
    And every sheet control including its primary action remains visible and tappable

  Scenario: A visible sheet keeps its input and primary action above the keyboard
    Given a sheet with a text input is visible
    And the on-screen keyboard is open
    When the input is focused
    Then the input and the primary action remain visible above the keyboard
    And the sheet keeps its snap points and brand styling

  Scenario: Taps reach sheet controls while the keyboard is open
    Given a sheet is visible with the on-screen keyboard open
    When the user taps a visible sheet control
    Then the tap is delivered to that control
    And no tap is swallowed by keyboard avoidance

  Scenario: Every focused sub-task uses the one sheet system
    Given help, detail, comments, search and first-run guidance are available
    When each is opened
    Then each uses this sheet system
    And none introduces a separate full-screen modal or a second overlay pattern
