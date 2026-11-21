Feature: Design-system conformance and dialog recovery
  As a user of DealsSeeker
  I want surfaces to follow one design language and dialogs to be easy to leave
  So that nothing looks off-system or traps me

  Scenario: Map colors come from the active palette
    Given an embedded map is rendered with the active theme
    When the map draws its background, markers, and pin
    Then every color is drawn from the active palette
    And no additional accent color is introduced

  Scenario: A dialog closes when its surroundings are tapped
    Given a non-destructive dialog is open
    When the user taps outside its content
    Then the dialog closes without changing the underlying data

  Scenario: Success is seen before navigation
    Given a form has been submitted successfully
    When the success message is shown
    Then the message remains perceivable before the user is moved to another view

  Scenario: Keyboard and cutouts do not hide controls
    Given the on-screen keyboard is open or the device has a bottom cutout
    When the user edits the last field of a form
    Then the field and the primary action remain visible
