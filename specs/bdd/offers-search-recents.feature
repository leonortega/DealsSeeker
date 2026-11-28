Feature: Recent searches and saved radius/filter presets
  As a deal hunter who repeats searches
  I want to recall past queries and saved search settings
  So that I can find the same deals again quickly without exposing my location

  Scenario: A successful query becomes a recent search
    Given the user executed a successful search for "coffee"
    When the user opens the search controls
    Then "coffee" shall be offered as a recent search
    And selecting it shall populate the query and run the same search

  Scenario: A preset reapplies a saved radius and filter
    Given the user saved a preset with a 2500 m coverage radius and the current filter selection
    When the user selects that preset
    Then the radius and filter controls shall show the saved values
    And offers shall be searched with those values

  Scenario: Failed, empty and over-limit queries are not recalled
    Given a lookup failed, a query was empty, or a query was pasted beyond the input cap
    When the user opens the search controls
    Then no entry for that query shall be offered as a recent search

  Scenario: Recent searches carry no coordinates
    Given recent searches and presets are displayed and read by assistive technology
    When the user inspects their values and the saved data behind them
    Then only query text and filter or radius selections shall be present
    And no device-location value, raw latitude or raw longitude shall be stored or shown

  Scenario: The user controls the accelerator list
    Given recent searches and presets are displayed
    When the user deletes one entry or clears all entries
    Then that entry or those entries shall no longer be offered
    And typing a new query shall remain unaffected

  Scenario: Entries are scoped to the active user
    Given one user saved a preset
    When a different user signs in and opens the search controls
    Then the first user's preset shall not be offered

  Scenario: Displaying entries does not trigger a lookup
    Given the search controls are open and recent searches are visible
    When the user scrolls through them without selecting one
    Then no lookup shall be issued

  Scenario: The accelerator list is bounded
    Given the recent-search cap has been reached
    When a new successful query is added
    Then the least recently used entry shall be discarded
    And the new query shall be offered
