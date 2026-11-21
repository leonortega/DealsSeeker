Feature: Visible action feedback in the immersive presentation
  As a deal hunter using the immersive feed
  I want every offer action to confirm its outcome where I am working
  So that I never wonder whether a vote or favorite was recorded

  Scenario: A successful vote is confirmed in the feed
    Given the immersive offers feed is active
    When the user submits an availability vote and the request succeeds
    Then a confirmation is displayed in the feed
    And the selected offer is unchanged

  Scenario: A failed action explains the problem in the feed
    Given the immersive offers feed is active
    When a favorite or vote request fails
    Then an error message is displayed in the feed
    And the active query and filter remain unchanged

  Scenario: Feedback is announced and does not cover controls
    Given action feedback is displayed in the feed
    When assistive technology traverses the surface
    Then the feedback is announced
    And the action rail and the mode control remain tappable

  Scenario: New feedback replaces the previous feedback
    Given a confirmation is displayed after a successful action
    When the user performs another action that fails
    Then the error message replaces the earlier confirmation
