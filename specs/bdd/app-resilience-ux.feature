Feature: Visible and recoverable offers search failure
  As a user on a real mobile connection
  I want a failed search to be visible and retryable where I am working
  So that I am never stranded by a failed request

  Scenario: Failed search shows an actionable error near the search controls
    Given the user is on the Offers view
    When the offers search request fails
    Then an error message is displayed near the search controls
    And the message states that the search failed and advises checking connectivity
    And a Retry action is available

  Scenario: Retry re-runs the search and clears the error on success
    Given the search-failure error is displayed
    And the current query is "coffee" with a radius of 1500 meters
    When the user selects the Retry action
    Then a new search is executed with that query and radius
    And when the search succeeds the error message is cleared

  Scenario: Immersive feed presents the search failure
    Given the immersive offers feed is active
    When the offers search request fails
    Then an error message and a Retry action are displayed in the feed

  Scenario: Search failure message uses plain language
    Given the offers search request failed
    When the error message is displayed
    Then no internal status code is shown as the primary message

  Scenario: Favorite failure does not display the search-failure state
    Given the offers search succeeded
    When changing a favorite fails
    Then a favorite-specific message is displayed
    And the search-failure error state is not displayed

  Scenario: Error state remains visible while a previous result set is shown
    Given a previous successful search result set is visible
    When a subsequent search fails
    Then the error message is displayed
    And the previous offers remain visible

  Scenario: Missing position is not a search failure
    Given device location is unavailable and no explicit override exists
    When the Offers view resolves the current position
    Then no location-bound search is executed
    And a location-unavailable state with a retry action is displayed

  Scenario: Errors use the single status surface
    Given an action in the Offers view has failed
    When the error feedback is displayed
    Then it appears on the same status surface used by other feedback
    And no second competing error banner is shown

  Scenario: Recovery preserves user work
    Given the user has a query, radius, filter, selected offer and an in-progress draft
    When a request fails and the user retries or continues with another action
    Then the query, radius, filter, selected offer and draft are unchanged
    And nothing the user entered is discarded

  Scenario: Expired error is cleared
    Given an error message is displayed
    When the condition is resolved, the user leaves the view, or the dwell ends
    Then the error message is no longer displayed
    And no expired error is left to be read
