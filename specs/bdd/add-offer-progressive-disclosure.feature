Feature: One-step-at-a-time progressive disclosure in Add Offer
  As a contributor
  I want to see only the step I am working on
  So that I do not scroll past sections that do not apply yet

  Scenario: Only the active step is presented
    Given the user opens Add Offer in create mode
    When the Photo step is active
    Then only the Photo controls are presented
    And no Place or Details section is present for the user to scroll to
    And the progress shows Photo as active with two steps remaining

  Scenario: Advancing reveals the next step only
    Given the Photo step is active with a photo attached
    When the user selects Next
    Then the Place controls are presented
    And the Photo controls are no longer part of the view
    And no Details section is present for the user to scroll to

  Scenario: Data survives steps that are hidden
    Given the user entered a photo, a place and a description across the three steps
    When the user moves from Details back to Photo and forward to Details again
    Then the photo, place and description are restored on their respective steps
    And no entered value is discarded while its step is inactive

  Scenario: Progress and explicit navigation remain available
    Given the user is on the Place step
    When the user reviews the step controls
    Then the progress identifies Place as active and one step as remaining
    And Next and Back are both available

  Scenario: Save and validation belong only to Details
    Given the user is on the Place step with a missing description
    When the user reviews the available actions
    Then no save action is presented
    When the user reaches Details and attempts to save
    Then a validation message is attached to the description field

  Scenario: Edit mode restores values of a not-yet-visited step
    Given the user opens Add Offer in edit mode for a user-owned offer
    When only the Photo step has been shown so far
    Then the saved place and details are restored when those steps later become active

  Scenario: No raw coordinates on any step
    Given an offer location has been confirmed on the Place step
    When the user moves through Photo, Place and Details
    Then no raw latitude or longitude values are shown

  Scenario: Back on the first step offers the existing cancel path
    Given the user is on the Photo step with an attached photo
    When the user selects Back
    Then the existing cancel path is offered
    And the attached photo is retained if the user stays
