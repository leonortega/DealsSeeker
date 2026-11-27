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

  Scenario: Short viewport uses a labelled disclosure
    Given the available vertical space is too short for action captions
    When the action rail is rendered
    Then secondary actions sit behind one visibly labelled control
    And its entries carry text labels and remain independently tappable
    And every action remains labelled for assistive technology

  Scenario: One vocabulary across all offer surfaces
    Given an offer appears on a card, in the feed, in favorites and in the detail sheet
    When the actions are rendered on each surface
    Then Directions, Favorite, Comments, Available? and Report use the same label and glyph everywhere
    And the actions appear in the same relative order on every surface

  Scenario: Immersive rail limits visible actions to four
    Given an offer exposes more than four actions in the immersive rail
    When the rail is rendered
    Then at most four actions are visible
    And the remaining actions sit behind one control labelled More
    And the actions inside More keep the canonical order
