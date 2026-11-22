Feature: First run to first value
  As a first-time deal hunter
  I want to reach a relevant nearby offer quickly
  So that I understand the product's value without a lengthy tutorial

  Scenario: First launch opens the immersive feed with brief guidance
    Given the app is launched for the first time with an authenticated session
    When the first view is displayed
    Then the immersive offers feed is the default presentation
    And brief, skippable guidance is presented

  Scenario: Guidance is not repeated for returning users
    Given the user has completed or skipped first-run guidance
    When the app is launched again
    Then first-run guidance is not displayed again

  Scenario: Location denial still leads to value
    Given the user denies location permission on first run
    When the Offers view loads
    Then an explanation of what was missed is shown
    And a way to browse without precise location remains available

  Scenario: Guidance is dismissible and labelled
    Given first-run guidance is displayed
    When the user activates its dismiss action
    Then the guidance closes
    And the offers feed remains fully usable
