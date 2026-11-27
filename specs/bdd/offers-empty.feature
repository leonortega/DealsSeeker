Feature: Guided unfiltered no-offers state
  As a user with no nearby offers
  I want clear guidance instead of a blank screen
  So that I can add an offer or widen my search

  Scenario: Standard view shows guidance instead of a blank surface
    Given the user is on the standard Offers view
    And no query or favorites filter is active
    When a search completes with no offers
    Then guidance stating that no offers are nearby is displayed
    And an action to add the first offer is available
    And an action to widen the search area is available

  Scenario: Immersive feed shows guidance instead of a blank surface
    Given the immersive offers feed is active
    And no query or favorites filter is active
    When a search completes with no offers
    Then the same unfiltered guidance is displayed in the feed
    And the feed surface is not blank

  Scenario: Authenticated user adds the first offer from the guidance
    Given an authenticated user is viewing the unfiltered no-offers guidance
    When the user selects the add-first-offer action
    Then the Add Offer view opens

  Scenario: Guest adds the first offer from the guidance
    Given a guest is viewing the unfiltered no-offers guidance
    When the guest selects the add-first-offer action
    Then a sign-in prompt is shown
    And the guest discovery context is preserved

  Scenario: Widen the search area re-runs the search
    Given the unfiltered no-offers guidance is displayed with a 1000 meter radius
    When the user selects the widen-search-area action
    Then the coverage radius increases
    And a new search runs with the increased radius
    And the results or the guidance update

  Scenario: Guidance is announced to assistive technology
    Given the unfiltered no-offers guidance is displayed
    When assistive technology reads the Offers view
    Then it announces that no offers are available
    And it exposes both the add-first-offer and widen-search-area actions

  Scenario: Guidance never blocks navigation
    Given the unfiltered no-offers guidance is displayed
    When the user searches, changes the coverage radius, switches presentation, or selects a shared footer destination
    Then the action is available and takes effect
    And no raw latitude or longitude value is displayed

  Scenario: Filtered no-results still uses the clear-filters state
    Given a query is active
    When a search completes with no offers
    Then the filtered no-results message and clear-filters action are displayed
    And the add-first-offer and widen-search-area guidance does not replace them

  Scenario: Widen action at the maximum radius is unavailable
    Given the unfiltered no-offers guidance is displayed with the coverage radius at its maximum
    When the user looks for the widen-search-area action
    Then the action is unavailable or states that the maximum has been reached

  Scenario: Guidance follows the user across a presentation switch
    Given the unfiltered no-offers guidance is displayed in the standard view
    When the user switches to the immersive feed
    Then the guidance remains visible in the immersive feed

  Scenario: Guidance labels expand without clipping
    Given a localized guidance label is longer than the English text
    When the unfiltered no-offers guidance is displayed
    Then the label wraps without clipping
    And both actions remain reachable
