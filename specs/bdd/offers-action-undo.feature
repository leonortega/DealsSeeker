Feature: One undo action for reversible offer actions
  As a user
  I want to reverse a just-completed favorite change or vote from the success feedback
  So that a mistaken action does not linger while I am still looking at the offer

  Scenario: Favorite toggle offers one undo in the status dwell
    Given an authenticated user sees an offer with no saved favorite state
    When the user toggles the favorite and the success status appears
    Then the status carries at most one Undo action for that toggle
    And the Undo action is announced with the status
    And the Undo action disappears when the status disappears

  Scenario: Favorite undo restores the prior state
    Given a favorite toggle success status with an Undo action is displayed
    When the user selects Undo within the dwell
    Then the offer returns to its previous favorite state
    And that state is consistent with the saved-favorites set

  Scenario: Vote undo defers submission until the window closes
    Given an authenticated user has not voted on an offer
    When the user casts a thumbs up vote and the optimistic counters update
    Then the success status carries one Undo action
    And no vote has been submitted while the undo window is open
    When the user selects Undo within the window
    Then the counters and the user's vote state are restored
    And no vote is submitted for that action

  Scenario: Undo is announced and does not cover controls
    Given a reversible action status with an Undo action is displayed in the feed
    When assistive technology traverses the surface
    Then the Undo action is announced with the status
    And the action rail, mode control and primary actions remain tappable

  Scenario: A user may vote again after undo without duplication
    Given a thumbs up vote was undone within its dwell
    When the same user casts a thumbs down vote on that offer
    Then the new vote is accepted
    And exactly one vote is recorded for that user and offer

  Scenario: Undo expires with the dwell and the pending vote is submitted
    Given a vote success status with an Undo action is displayed
    When the dwell elapses without Undo being selected
    Then the status and the Undo action are no longer displayed
    And the pending vote is submitted exactly once

  Scenario: A new message retires the old undo and commits a pending vote
    Given a vote success status with a pending Undo action is displayed
    When another action produces a new status message
    Then only the new message is displayed
    And the pending vote is submitted exactly once
    And no Undo action from the previous message remains

  Scenario: Leaving the view commits a pending vote and clears undo
    Given a vote success status with a pending Undo action is displayed
    When the user navigates away before the dwell ends
    Then no stale status or Undo action remains
    And the pending vote is submitted exactly once

  Scenario: No undo on errors or non-reversible actions
    Given an action failed or an action other than a favorite toggle or vote succeeded
    When the status message is displayed
    Then no Undo action is presented with it

  Scenario: Undo feedback exposes no raw coordinates
    Given a reversible action status with an Undo action is displayed
    When the user reads the status and its Undo action
    Then no raw latitude or longitude values are shown
    And the selected offer and active filter are unchanged
