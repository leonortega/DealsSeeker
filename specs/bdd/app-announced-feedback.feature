Feature: Announced feedback, focused dialogs and TalkBack traversal sign-off
  As a user relying on TalkBack
  I want outcomes announced, dialogs to hold focus, and legible text in both appearances
  So that I never lose my place or miss a failed action at any font scale

  Scenario: Validation feedback is announced
    Given the user is completing a contribution or registration form
    When required content is missing and the user attempts to submit
    Then each missing item is identified in a message
    And the message is announced to TalkBack
    And the entered data remains available

  Scenario: An error is distinguishable without color
    Given a load or save operation has failed
    When the failure message is shown
    Then the message text identifies the failure
    And the failure is not conveyed by color alone

  Scenario: Focus stays within an open dialog
    Given an offer detail, comments, help, or search dialog is open
    When TalkBack moves through the dialog
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

  Scenario: Traversal sign-off covers announcements and dialogs
    Given TalkBack is enabled at the default and 200 percent font scales
    When each supported surface is traversed and a status or dialog is produced
    Then every status is announced and dialog focus stays contained
    And sign-off evidence records the result for each surface and scale

  Scenario: Status and dialog text contrast is measured in both appearances
    Given a status message and a dialog are shown in the light appearance and again in the dark appearance
    When their text is measured against its surface
    Then the measured contrast meets the accessibility thresholds in both appearances
    And the evidence is recorded

  Scenario: Dialog content reflows at 200 percent font scale
    Given the Android font scale is set to 200 percent
    When a dialog with a long localized message is opened
    Then its content reflows without clipping
    And its labelled close and action controls remain reachable
