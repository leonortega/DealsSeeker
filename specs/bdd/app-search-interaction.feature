Feature: Search interaction under high request volume
  As a user
  I want fast typing to feel responsive
  So that I always see results for what I currently typed

  Scenario: Lookup is issued after a quiet period
    Given the user is typing in a search-like input
    When the user types and then stops changing the value
    Then the system shall wait for a short quiet period after the last input
    And the lookup shall be issued only after that quiet period elapses

  Scenario: Superseded in-flight lookup is abandoned
    Given a lookup for an input is in flight
    When the user enters a new input
    Then the in-flight lookup for the superseded input shall be abandoned
    And its result shall not be shown

  Scenario: Stale result does not replace current results
    Given a lookup for an earlier input is in flight
    And the user has already changed the input
    When the earlier lookup's result arrives
    Then the result shall be discarded
    And the current results shall not be replaced by it

  Scenario: Interface stays usable during a lookup
    Given a lookup is in flight
    Then a progress indication shall be shown scoped to the affected content
    And the user shall remain able to interact with the search input and the rest of the view

  Scenario: Previous results remain visible until new results arrive
    Given previous results are displayed for the search-like input
    When a new lookup is issued
    Then the search input shall remain usable
    And the previous results shall remain visible until the new results arrive

  Scenario: Lookup errors are recoverable
    Given a lookup fails with an error
    When the error is surfaced
    Then the progress indication shall be dismissed
    And the user shall be able to interact and issue a new lookup
    And the interface shall not remain blocked

  Scenario: Displaying recent searches does not issue a lookup
    Given the search-like input is focused
    And recent searches and saved presets are displayed
    When the user scrolls them without selecting an entry
    Then no lookup shall be issued by displaying or focusing them
    And the quiet period shall apply only to typed input

  Scenario: Selecting a recent search supersedes typed input
    Given a lookup for typed input is in flight
    When the user selects a recent search
    Then the selected value shall replace the current input in one step
    And the in-flight lookup for the typed input shall be abandoned
    And its result shall not replace the current results

  Scenario: Recent searches carry no location values
    Given recent searches and saved presets are displayed
    When the user reads them or assistive technology announces them
    Then only query text and filter or radius selections shall be presented
    And no device-location value or raw coordinate shall be presented

  Scenario: Selecting a coverage option through a Material 3 control supersedes a lookup
    Given a lookup for typed input is in flight
    When the user selects a coverage option through a Material 3 selection control
    Then the typed lookup is abandoned under the same supersession rule
    And the selected option announces its selected state

  Scenario: Material 3 selection controls keep their semantics at 200 percent font scale
    Given the Android font scale is set to 200 percent
    When a coverage option is rendered in a Material 3 selection control
    Then its name, role and selected state are unchanged
    And its label reflows without clipping
