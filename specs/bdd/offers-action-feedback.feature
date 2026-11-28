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

  Scenario: One primary action leads the offer rail
    Given the immersive offers feed is active
    When an offer is displayed
    Then one action is visually marked as the primary action
    And maintenance actions remain visually secondary

  Scenario: New feedback replaces the previous feedback
    Given a confirmation is displayed after a successful action
    When the user performs another action that fails
    Then the error message replaces the earlier confirmation

  Scenario: Both presentations use the same feedback surface
    Given the same offer action is available in the standard and immersive presentations
    When the action succeeds in each presentation
    Then the confirmation uses the same status surface and placement in both
    And its wording follows the same plain-language pattern

  Scenario: Stale feedback is cleared when the user moves on
    Given a confirmation is displayed for the currently selected offer
    When the user selects a different offer or leaves the Offers view
    Then the earlier confirmation is no longer displayed
    And no expired message is left to be read

  Scenario: Feedback preserves the user's work context
    Given the user has an active query, filter, selected offer and a partially written report
    When an offer action produces feedback
    Then the query, filter, selected offer and report draft are unchanged
    And the scroll position is unchanged

  Scenario: Feedback does not stack with another status panel
    Given a search-failure error panel is displayed
    When an offer action produces feedback
    Then only the single status surface carries the new feedback
    And the search-failure state is unchanged or replaced, not duplicated

  Scenario: Action feedback follows the snackbar pattern in both presentations
    Given the same offer action is available in the standard and immersive presentations
    When the action produces feedback
    Then the feedback shall appear on one non-interrupting Material 3 snackbar-pattern status surface in both presentations
    And the action rail, mode control and primary actions shall remain tappable

  Scenario: Temporary and persistent snackbar forms keep their behavior
    Given an offer action produces transient feedback and another produces feedback that waits for an action
    When each is displayed on the status surface
    Then the transient feedback shall follow its dwell
    And the waiting feedback shall remain until the user acts or dismisses it
    And undo behavior and work preservation shall be unchanged

  Scenario: Long localized feedback and undo fit one snackbar surface
    Given feedback wraps to several lines and carries one undo action
    When it is displayed in the immersive presentation
    Then the message and undo action shall remain on the one status surface
    And no raw coordinate value shall be shown
