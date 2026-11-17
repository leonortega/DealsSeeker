Feature: Silent auto-addition of suggested tags in Add Offer view
  As a user
  I want related tags added automatically without extra UI
  So that my offer is discoverable while the tag section stays simple

  Scenario: Related tags are added silently from a typed tag
    Given the user typed "denims " so the tag "denims" is selected
    And multilingual suggestion dictionaries are available
    When the suggestion engine runs
    Then the tag "denim" is added automatically
    And no Suggested Tags section is displayed

  Scenario: One-level expansion only
    Given the description-derived tag "coffee" has immediate suggestions "cafe" and "espresso"
    When the suggestion engine runs
    Then only the immediate suggestions of "coffee" are auto-added
    And no tag derived from "cafe" or "espresso" is auto-added

  Scenario: Short suggestions are ignored
    Given a description-derived tag has a related tag whose normalized form has fewer than 3 characters
    When the suggestion engine runs
    Then that short tag is not added to the tag list

  Scenario: Removed suggested tag stays removed
    Given the tag "denim" was auto-added from the description-derived tag "denims"
    When the user removes the tag "denim"
    Then the tag "denim" is not re-added automatically

  Scenario: Clearing description clears suggestion state
    Given the description-derived tag "denims" produced an auto-added "denim" tag
    When the user clears the description text
    Then the selected tag list is empty
    And no suggestion state remains
