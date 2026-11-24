Feature: Screen-reader focus on destination changes
  As a user who relies on a screen reader
  So that I always know which destination is active after navigation or Back

  Scenario: Switching destinations announces the new destination
    Given a screen reader is enabled on the main shell
    When the user activates a footer destination
    Then the destination name shall be announced in the active language
    And focus shall be placed on the destination's primary heading before its controls

  Scenario: System Back restores focus
    Given the user opened a destination from a control on Offers
    When the user invokes system Back
    Then Offers shall become visible
    And focus shall be placed on the Offers heading or container before its controls

  Scenario: Repeated navigation stays deterministic
    Given the user activates the already-selected footer destination
    When the destination is activated again
    Then focus and announcements shall remain deterministic
    And no duplicate announcement shall be produced
