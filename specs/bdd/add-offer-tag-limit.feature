Feature: Bounded tag list in Add Offer view
  As a community contributor
  I want the tag list capped at the declared limit
  So that my offer can be submitted without manual cleanup

  Scenario: Automatic tags stop at the declared limit
    Given the user types a description with more than 10 taggable words
    When description and suggestion tags are generated
    Then the selected tag list holds exactly 10 tags
    And the limit is announced once

  Scenario: Description tags win over suggestions
    Given the description has already produced 10 tags
    When suggestion expansion would add more tags
    Then no suggestion tag is added
    And all description-derived tags already selected remain

  Scenario: Manual addition at the limit is refused with feedback
    Given the tag list already holds 10 tags
    When the user taps a detected word
    Then the list still holds 10 tags
    And the limit message is shown

  Scenario: Removing a tag frees a slot
    Given the tag list holds 10 tags
    When the user removes one tag
    Then a new tag can be added
