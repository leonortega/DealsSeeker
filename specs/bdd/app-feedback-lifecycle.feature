Feature: Transient feedback lifecycle
  As a user of DealsSeeker
  I want status messages to clear after I have read them
  So that stale confirmations do not linger on the screen

  Scenario: Success feedback disappears on its own
    Given a user action produced a success message
    When the short dwell elapses without further input
    Then the message is no longer displayed

  Scenario: Error feedback stays longer but still disappears
    Given a user action produced an error message
    When the short dwell elapses
    Then the message is still displayed
    When the longer dwell elapses
    Then the message is no longer displayed

  Scenario: A new message replaces the previous one
    Given a status message is displayed
    When another action produces a new message
    Then only the new message is displayed
    And its dwell starts from the beginning

  Scenario: Leaving the view clears the feedback
    Given a status message is displayed
    When the user navigates away from the view
    Then no stale message remains when the view is opened again
