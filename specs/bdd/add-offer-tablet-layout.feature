Feature: Tablet composition for Add Offer view
  As a community contributor on a tablet
  I want the form to use the available width
  So that I can see images, location, and details without a long single column

  Scenario: Phone width keeps one column
    Given the Add Offer view is displayed on a phone-width surface
    When the form renders
    Then image, location, description, and submit controls appear in one vertical column
    And their reading order is unchanged

  Scenario: Tablet width uses two columns
    Given the Add Offer view is displayed on a native tablet-width surface
    When the form renders
    Then image and location panels appear in a first column
    And description, tag, and primary-action controls appear in a second column
    And each control appears exactly once

  Scenario: Tablet composition preserves behavior
    Given the Add Offer view is in the two-column composition
    When the user confirms a location, types a description, and submits
    Then the same validation, feedback, and navigation rules apply as on a phone
