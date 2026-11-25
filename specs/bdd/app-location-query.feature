Feature: Location query debounce, cache, and reverse-geocode timing
  As a user
  I want place search to be quiet and fast
  So that addresses resolve without wasting public geocoding quota

  Scenario: Search waits for a quiet period
    Given the user types a location name character by character
    When characters arrive faster than the quiet period
    Then no lookup is issued until typing stops
    And only one lookup is issued for the final text

  Scenario: Repeated identical queries reuse cached results
    Given a place search for a query has already returned results
    When the user searches for the same query again within the cache period
    Then the previously returned results are shown
    And no additional Photon call is made

  Scenario: Superseded result is discarded
    Given a lookup is in flight for an earlier query
    When the user changes the query
    Then the earlier result is never shown
    And the current query is looked up after the quiet period

  Scenario: Reverse geocoding follows gesture completion
    Given the Add Offer mini map is visible
    When the user drags the map and keeps moving
    Then no reverse-geocode request is issued during the drag
    When the drag ends
    Then one reverse-geocode request is issued for the final center

  Scenario: Reverse geocode on a completed tap
    Given the user taps a point on the mini map
    When the tap completes
    Then the pin is placed and one reverse-geocode request is issued for that point

  Scenario: Initial position is resolved once
    Given the device position arrives when Add Offer opens
    When the label has been resolved
    Then no further reverse-geocode request is issued until a gesture completes

  Scenario: Failed lookup keeps the draft location
    Given a location is selected for the draft
    When the geocoding service fails
    Then an error with a retry path is shown
    And the draft location is unchanged
