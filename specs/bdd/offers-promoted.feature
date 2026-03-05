Feature: Promoted offers in initial home feed
  As a user
  I want sponsored offers clearly shown at first load
  So that promoted content can be surfaced before search

  Scenario: Initial feed shows promoted offers before standard feed
    Given promoted offers are available
    And the user has not executed a search
    When the Offers home feed loads
    Then promoted offers are shown first or in a distinct promoted section
    And promoted offers are clearly labeled

  Scenario: Promoted offer retrieval failure does not block feed
    Given promoted offers cannot be retrieved
    When the Offers home feed loads
    Then standard offers are still shown
    And the feed remains interactive
