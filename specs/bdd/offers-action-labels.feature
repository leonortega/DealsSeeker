Feature: Visible labels for offer actions
  As a deal hunter using one hand on a phone
  I want every offer action to be labelled
  So that I never have to guess what an icon does

  Scenario: Phone presentation shows action labels
    Given an offer is displayed on a phone in portrait
    When the action controls are rendered
    Then each action shows a visible text label
    And the directions action is the only waypoint-accented action

  Scenario: Large text keeps actions labelled
    Given the system text size is set to 150 percent or higher
    When the action controls are rendered
    Then each action is either visibly labelled or reachable through a visibly labelled disclosure
    And no label clips or overlaps another control

  Scenario: Short viewport keeps actions tappable and labelled
    Given the available vertical space is too short for action captions
    When the action controls are rendered
    Then captions are omitted
    And every action remains independently tappable and labelled for assistive technology
