Feature: Recoverable no-results and empty discovery states
  As a deal hunter
  I want an empty result to explain itself and offer a next step
  So that I never hit a dead end while looking for nearby offers

  Scenario: Filtered search with no results offers to clear filters
    Given the user is on the Offers view
    And a query is active
    When a search completes with no matching offers
    Then a message states that no offers matched the current filters
    And an action to clear the active filters is available

  Scenario: Clearing filters re-runs the search with the current radius
    Given the no-results state is displayed for an active query
    And the current coverage radius is 1000 meters
    When the user selects the clear-filters action
    Then the query and favorites filter are reset
    And a new search is executed using the 1000 meter radius
    And available offers are displayed

  Scenario: No offers at all shows no empty-state card
    Given the user is on the Offers view
    And no query or favorites filter is active
    When a search completes with no offers
    Then no empty-state message or creation prompt is displayed
    And the Offers controls and map remain usable

  Scenario: Immersive feed keeps an uncluttered empty surface
    Given the immersive offers feed is active
    When a search completes with no offers
    Then no empty-state message is displayed in the feed

  Scenario: Favorites-only filter with no matches offers recovery
    Given the favorites-only filter is active
    When a search completes with no matching favorites
    Then a message states that no offers matched the current filters
    And an action to clear the active filters is available
