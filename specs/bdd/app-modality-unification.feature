Feature: One sheet system and one native-route system
  As a DealsSeeker user
  I want every overlay and full-screen view to behave the same way
  So that Back and focus never depend on which screen I am on

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
