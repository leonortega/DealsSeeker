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
    And any undo action on the previous message is retired

  Scenario: Leaving the view clears the feedback
    Given a status message is displayed
    When the user navigates away from the view
    Then no stale message remains when the view is opened again

  Scenario: Success feedback may offer one undo action
    Given a user action produced a success message for a reversible action
    When the message is displayed
    Then at most one undo action is presented with the message
    And the undo action is announced with the message
    And selecting it restores the state from before the action

  Scenario: Undo disappears with its message
    Given a success message with an undo action is displayed
    When the short dwell elapses without the undo action being used
    Then neither the message nor the undo action is displayed
    And the action's outcome stands

  Scenario: Error feedback does not offer undo
    Given a user action produced an error message
    When the message is displayed
    Then no undo action is presented with it

  Scenario: Every mutation shows pending then one outcome
    Given a user action is about to mutate saved data
    When the action starts
    Then a pending indication shall be visible and announced to assistive technology
    When the action succeeds or fails
    Then exactly one terminal status message shall be shown
    And no pending indication shall remain

  Scenario: Failure is described plainly and never as success
    Given a mutation has failed
    When its status message is shown
    Then the message shall describe the failure in plain language
    And the message shall not be presented as a success

  Scenario: A persistent message stays until it is dismissed
    Given a status message is designated persistent
    When the short dwell and the longer dwell elapse
    Then the message shall still be displayed
    And a visible, labelled dismiss control shall be available
    When the user selects dismiss
    Then the message shall no longer be displayed

  Scenario: A transient message does not remove a persistent message
    Given a persistent message is displayed
    When another action produces a transient message
    Then the persistent message shall remain displayed
    And the transient message shall follow its own dwell

  Scenario: Every reversible action offers undo
    Given an action whose prior state can be restored has succeeded
    When its success message is shown
    Then one undo action shall be presented with the message
    And selecting it shall restore the prior state

  Scenario: An irreversible action offers no undo
    Given an action whose prior state cannot be restored has succeeded
    When its success message is shown
    Then no undo action shall be presented with it

  Scenario: Status messages follow a non-interrupting snackbar pattern
    Given a user action is about to produce a status message
    When the message is displayed on the unified status surface
    Then it shall follow a Material 3 snackbar pattern that does not block the current view or take focus
    And its message and any single action shall be presented together on the one surface

  Scenario: The snackbar pattern keeps temporary and persistent forms distinct
    Given a transient message and a persistent message are both specified
    When each is displayed on the unified status surface
    Then the transient message shall auto-dismiss after its own dwell
    And the persistent message shall remain until the user dismisses it or acts on it
    And the undo behavior and dwell rules shall be unchanged

  Scenario: A long localized snackbar message with an action stays on one surface
    Given a status message wraps to several lines and carries one undo action
    When it is displayed on the unified status surface
    Then the message and the undo action shall remain together on that one surface
    And the current view shall stay interactive and the message shall stay announced
