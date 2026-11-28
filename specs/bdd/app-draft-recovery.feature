Feature: Add Offer draft recovery
  As a community contributor who keeps getting interrupted
  I want my unfinished offer to still be there when I come back
  So that I never have to retype my work or lose it silently

  Scenario: Background and resume keeps the draft
    Given the user has entered a description and selected tags in Add Offer
    When the application is backgrounded and then returned to the foreground
    Then Add Offer is shown again with the same field values
    And no fresh empty form is displayed

  Scenario: Returning after navigating away offers to resume
    Given the user navigated away from Add Offer with a non-empty draft
    When the user reopens Add Offer
    Then an offer to resume the retained draft is presented
    And explicit Resume and Discard choices are available
    And no draft is submitted

  Scenario: Relaunch offers the most recent draft
    Given the application was terminated with a non-empty draft
    When the application is relaunched
    Then an offer to resume that draft is presented before a new offer is started
    And selecting Resume restores every entered field value

  Scenario: Discard clears the draft for good
    Given an offer to resume a retained draft is presented
    When the user chooses Discard and confirms the discard
    Then the retained draft is cleared
    And no resume offer appears on a later launch

  Scenario: A successful submission clears the draft
    Given a retained draft corresponds to an offer the user later submitted successfully
    When the application is relaunched
    Then no resume offer for that offer is presented

  Scenario: Recovery is announced and privacy-safe
    Given a resume offer is presented with assistive technology enabled
    When the user reviews the restored field values
    Then the resume offer and restored values are announced
    And the confirmed location is shown as a human-readable label
    And no raw latitude or longitude value is shown

  Scenario: An empty or location-only draft is not offered
    Given the draft has no user-entered content beyond an auto-populated device location
    When the application is relaunched
    Then no resume offer is presented
    And Add Offer starts with a fresh draft
