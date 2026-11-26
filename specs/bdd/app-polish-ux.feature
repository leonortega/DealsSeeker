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

  Scenario: Error status is visually distinct
    Given a form submission has failed
    When the error status is displayed
    Then it is visually distinct from a success status
    And its meaning is also conveyed by the message text

  Scenario: Embedded web documents share the app font stack
    Given an embedded map is rendered
    When the document is loaded
    Then it uses the application's system sans font stack

  Scenario: Keyboard and cutouts do not hide controls
    Given the on-screen keyboard is open or the device has a bottom cutout
    When the user edits the last field of a form
    Then the field and the primary action remain visible

  Scenario: Search and filter controls are pills
    Given the standard or immersive Offers view is displayed
    When the search input and filter actions are rendered
    Then they use fully rounded corners
    And the surrounding panel keeps its structural corner radius

  Scenario: Embedded map uses the panel corner treatment
    Given an embedded map is rendered in the Offers or Add Offer view
    When the map surface is displayed
    Then it sits within a rounded, 1px-bordered surface using the active palette
    And the map meets the border with no padding gap
    And the map content is clipped to that surface's corners

  Scenario: Standard Offers view has no scroll indicators
    Given the authenticated user is on the standard Offers view
    When the view content is scrolled
    Then no vertical or horizontal scroll indicator is displayed

  Scenario: Raised surfaces keep one soft shadow on both platforms
    Given an offer card and a primary action are displayed on iOS and Android
    When the surfaces are rendered
    Then each keeps the single low, soft shadow from the design system
    And no hard-offset or stacked shadow is introduced
