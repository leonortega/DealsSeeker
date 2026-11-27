Feature: User-confirmed tag suggestions in Add Offer view
  As a contributor
  I want related tags offered as choices
  So that only the tags I accept describe my offer

  Scenario: Related tags are offered but not auto-added
    Given the user typed "denims " so the tag "denims" is selected
    And multilingual suggestion dictionaries are available
    When suggestions are computed
    Then "denim" is offered as a suggestion
    And the selected tag list still contains only "denims"

  Scenario: One-level expansion only
    Given the description-derived tag "coffee" has immediate suggestions "cafe" and "espresso"
    When the user accepts "cafe"
    Then suggestions derived from "cafe" are not offered

  Scenario: Short suggestions are ignored
    Given a description-derived tag has a related tag whose normalized form has fewer than 3 characters
    When suggestions are computed
    Then that short tag is not presented as a suggestion

  Scenario: Declined suggestion stays declined
    Given the user declined the suggested tag "denim"
    And the source description-derived tag "denims" is unchanged
    When suggestions are refreshed
    Then "denim" is not offered again

  Scenario: Clearing description clears suggestion state
    Given the description-derived tag "denims" produced an offered "denim" suggestion
    When the user clears the description text
    Then the selected tag list is empty
    And no suggestion state remains

  Scenario: Suggestions require explicit acceptance
    Given a suggestion "denim" is displayed with an Add control
    When the user selects Add for "denim"
    Then "denim" is added to the selected tag list
    And no tag is added without such an explicit selection

  Scenario: Removed accepted tag is not silently restored
    Given the user accepted the suggested tag "denim"
    When the user removes "denim" from the tag list
    Then "denim" stays removed until the user accepts it again or clears the description
