Feature: Material 3 conformance and dialog recovery
  As a user of DealsSeeker
  I want surfaces to follow Material 3 shape, elevation and color roles and dialogs to be easy to leave
  So that nothing looks off-system, traps me, or loses a status message

  Scenario: Map colors come from the active Material 3 roles
    Given an embedded map is rendered with the active theme
    When the map draws its background, markers, and pin
    Then every color comes from the active Material 3 roles
    And no color outside the active scheme is introduced

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
    Then it uses the Material 3 semantic error roles in a visually distinct way
    And its meaning is also conveyed by the message text

  Scenario: Embedded web documents share the app font stack
    Given an embedded document is rendered
    When the document is loaded
    Then it uses the Material 3 default typeface stack

  Scenario: Keyboard and cutouts do not hide controls
    Given the on-screen keyboard is open or the device has a bottom cutout
    When the user edits the last field of a form or a sheet input
    Then the field, its primary action and the sheet's primary action remain visible

  Scenario: Keyboard avoidance does not swallow taps
    Given a sheet is visible with the on-screen keyboard open
    When the user taps a visible sheet control
    Then the tap reaches that control
    And no visible control is skipped by the keyboard-avoidance behavior

  Scenario: Search and filter controls use Material 3 shape tokens
    Given the standard or immersive Offers view is displayed
    When the search input and filter actions are rendered
    Then each uses the shape token its Material 3 component pattern specifies
    And full rounding is used only where Material 3 defines it
    And structural panels use their own M3 shape tokens

  Scenario: Embedded map uses the Material 3 surface treatment
    Given an embedded map is rendered in the Offers or Add Offer view
    When the map surface is displayed
    Then it sits within a Material 3 surface using an M3 shape token and the active outline role
    And the map meets the boundary with no padding gap
    And the map content is clipped to that surface's shape

  Scenario: Standard Offers view has no scroll indicators
    Given the authenticated user is on the standard Offers view
    When the view content is scrolled
    Then no vertical or horizontal scroll indicator is displayed

  Scenario: Recovery panels sit below immersive top controls
    Given the immersive offers feed shows a no-results or search-error state
    When the view is rendered
    Then the state panel appears below the presentation switch and search controls
    And the top controls remain unobscured and reachable

  Scenario: Raised surfaces use Material 3 tonal elevation
    Given an offer card and a primary action are displayed on iOS and Android
    When the surfaces are rendered
    Then each uses the tonal elevation its Material 3 pattern specifies
    And no authored ambient, stacked or hard-offset shadow is introduced

  Scenario: One status surface serves the whole view
    Given a view has produced a status message
    When a different action produces another status message in the same view
    Then only one status surface is present
    And it occupies the same location used by the first message
    And no competing status banner is shown

  Scenario: An expired status message is not left visible
    Given a status message describes an action whose outcome has since changed
    When the user returns to that view
    Then no expired message is displayed
    And the current state is reflected instead

  Scenario: Colors follow Material 3 roles without a one-accent limit
    Given a view displays a primary action and a status message
    When the surfaces are rendered
    Then each color comes from the active Material 3 roles
    And the status message uses its M3 semantic role and text
    And no color outside the active scheme is introduced

  Scenario: Top bar uses one compact row
    Given the Offers app bar is displayed
    When its controls are rendered
    Then the help, search and presentation controls appear in one row
    And no control or label is repeated in a second row
    And each control remains separately reachable

  Scenario: Forms keep guidance attached to each field
    Given a form field has guidance and a validation message
    When the field is rendered
    Then the guidance and validation are attached to that field
    And no full-width accent band duplicates them

  Scenario: Material components govern shape and elevation
    Given platform Material 3 components render a primary action, a search control, a card and the navigation surface
    When the surfaces are compared with the design system
    Then M3 shape tokens, tonal elevation and active color roles are used
    And no authored pill, waypoint accent, night footer or ambient shadow is reapplied

  Scenario: Component defaults do not duplicate the status surface
    Given a Material status surface, dialog or sheet is used for feedback
    When a second action produces another status message
    Then only one status surface remains
    And the message lifecycle and guarded dismissal are unchanged

  Scenario: Former shape rules do not override M3 defaults
    Given a component default shape differs from an authored pill rule
    When the component is rendered
    Then the Material 3 shape token governs
    And no second shape language is introduced
