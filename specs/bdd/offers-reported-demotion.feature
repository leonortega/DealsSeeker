Feature: Reported offers demotion and visual indicator
  As a user
  I want potentially problematic offers deprioritized and flagged
  So that safer and more relevant offers appear first

  Scenario: Reported offers demoted in main feed
    Given the feed contains reported and non-reported offers
    When the Offers feed is rendered
    Then reported offers appear below non-reported offers
    And each reported offer has a red visual indicator

  Scenario: Reported offers demoted in search results
    Given a search returns reported and non-reported offers
    When results are ranked for display
    Then reported offers appear below non-reported offers
    And each reported offer remains visually flagged in red
