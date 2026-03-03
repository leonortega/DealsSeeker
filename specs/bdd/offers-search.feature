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

  Scenario: Offers location text uses address labels
    Given the Offers view has a resolved current location context
    When the map and header location context are rendered
    Then the user sees a human-readable address label
    And raw latitude and longitude values are not shown in UI text

  Scenario: Coverage radius change with active query triggers search refresh
    Given the user entered a non-empty search query
    And current search results are shown
    When the user changes the coverage radius value
    Then the app executes search again using the same query and new radius
    And the offer list is refreshed
    And map markers are refreshed
    And map zoom is adjusted to show the selected coverage radius

  Scenario: Coverage radius change without query triggers distance-only refresh
    Given the search textbox is empty
    And current search results are shown
    When the user changes the coverage radius value
    Then the app executes search again using distance filtering only
    And the offer list is refreshed
    And map markers are refreshed
    And map zoom is adjusted to show the selected coverage radius
