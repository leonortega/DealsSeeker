Feature: Search offers by tags in Offers view
  As a user
  I want to search offers by product text
  So that I can quickly find relevant deals near me

  Scenario: Search query filters list and map markers
    Given active offers exist with tags including "coffee"
    And businesses are visible on the Offers map
    When the user searches for "coffee"
    Then only offers with matching tags are shown in the list
    And only businesses with matching active offers are shown as markers

  Scenario: Clearing query resets all results
    Given the user previously filtered offers with a search query
    When the user clears the query
    Then the full active offer set is shown
    And markers reflect the full active offer set

  Scenario: No matching tags returns empty state
    Given active offers exist
    When the user searches for "nonexistenttag"
    Then no offers are shown
    And no business markers are shown

