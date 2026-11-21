Feature: Announced feedback and focused dialogs
  As a user relying on assistive technology
  I want outcomes to be announced and dialogs to hold focus
  So that I never lose my place or miss a failed action

  Scenario: Validation feedback is announced
    Given the user is completing a contribution or registration form
    When required content is missing and the user attempts to submit
    Then each missing item is identified in a message
    And the message is announced to assistive technology
    And the entered data remains available

  Scenario: An error is distinguishable without color
    Given a load or save operation has failed
    When the failure message is shown
    Then the message text identifies the failure
    And the failure is not conveyed by color alone

  Scenario: Focus stays within an open dialog
    Given an offer detail, comments, help, or search dialog is open
    When assistive technology moves through the dialog
    Then focus does not reach content behind the dialog
    And a labelled control closes the dialog

  Scenario: Focus returns after dismissal
    Given a dialog was opened from a control
    When the dialog is dismissed
    Then focus returns to that control or an equivalent control

  Scenario: Success is perceivable before navigation
    Given a contribution or report has been submitted successfully
    When the success confirmation is shown
    Then the confirmation is announced
    And the confirmation remains perceivable before the user is moved to another view
