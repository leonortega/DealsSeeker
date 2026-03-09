Feature: Smart search in Offers view
  As a user
  I want search to include exact, fuzzy, and synonym matching
  So that I can find relevant offers even with spelling or wording differences

  Scenario: Merge exact, fuzzy, and synonym result sets
    Given offers exist for tags "coffee", "cafe", and "espresso"
    And smart search dictionaries are loaded for the selected language
    When the user searches for "coffe"
    Then exact, fuzzy, and synonym candidate sets are evaluated
    And merged unique results are returned
    And results are ranked by relevance score

  Scenario: Smart search falls back when dictionary is unavailable
    Given synonym dictionary for the selected language is unavailable
    When the user searches for "coffee"
    Then exact matching still returns results
    And the search flow does not fail
