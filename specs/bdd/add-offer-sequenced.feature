Feature: Sequenced Add Offer flow with visible progress
  As a contributor
  I want a guided three-step contribution
  So that I always know where I am and what remains

  Scenario: Three named steps with visible progress
    Given the user opens Add Offer in create mode
    When the view renders
    Then the progress shows Photo as active with two steps remaining
    And Place and Details are listed only as remaining steps

  Scenario: Only the active step's controls are presented
    Given the user opens Add Offer in create mode
    When the Photo step is active
    Then the Photo controls are presented
    And no Place or Details control is present to scroll to

  Scenario: Moving between steps preserves entered data
    Given the user attached a photo on the Photo step and entered a place on the Place step
    When the user moves forward to Details and then back to Photo
    Then the attached photo and the entered place are still present
    And the data entered on each hidden step is restored when that step is shown again

  Scenario: Save and validation live on the Details step
    Given the user reached the Details step with a missing description
    When the user attempts to save
    Then the save action is available on that step
    And a validation message is attached to the description field
    And no save action is presented on an earlier step

  Scenario: Edit mode prefills every step
    Given the user opens Add Offer in edit mode for a user-owned offer
    When each step becomes active in turn
    Then the existing photos, place and details are prefilled in their respective steps

  Scenario: No raw coordinates in any step
    Given an offer location has been confirmed on the Place step
    When the user views any step
    Then no raw latitude or longitude values are shown

  Scenario: Back on the first step keeps entered data
    Given the user is on the Photo step with a photo already attached
    When the user requests Back
    Then the existing cancel path is offered
    And the attached photo is not discarded
