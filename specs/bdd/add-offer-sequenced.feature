Feature: Sequenced Add Offer flow with visible progress
  As a contributor
  I want a guided three-step contribution
  So that I always know where I am and what remains

  Scenario: Three named steps with visible progress
    Given the user opens Add Offer in create mode
    When the view renders
    Then the steps Photo, Place and Details are shown in that order
    And the active step and the number of remaining steps are visible

  Scenario: Moving between steps preserves entered data
    Given the user attached a photo on the Photo step and entered a place on the Place step
    When the user moves forward to Details and then back to Photo
    Then the attached photo and the entered place are still present

  Scenario: Save and validation live on the Details step
    Given the user reached the Details step with a missing description
    When the user attempts to save
    Then the save action is available on that step
    And a validation message is attached to the description field

  Scenario: Edit mode prefills every step
    Given the user opens Add Offer in edit mode for a user-owned offer
    When each step is rendered
    Then the existing photos, place and details are prefilled in their respective steps

  Scenario: No raw coordinates in any step
    Given an offer location has been confirmed on the Place step
    When the user views any step
    Then no raw latitude or longitude values are shown
