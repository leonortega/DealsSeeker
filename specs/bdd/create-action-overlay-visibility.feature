Feature: Create action visibility during overlays
  As a deal hunter or contributor
  I want overlay controls to stay unobstructed
  So that a floating action never blocks a sheet's dismissal control

  Scenario: Create action hides while a sheet is open
    Given the create-offer floating action button is visible
    When an overlay bottom sheet opens
    Then the create-offer floating action button shall not be displayed
    And the sheet's dismissal control shall be unobstructed

  Scenario: Create action returns when the sheet closes
    Given an overlay bottom sheet is open and the create action is hidden
    When the sheet is dismissed
    Then the create-offer floating action button shall be displayed at its prior position
    And selecting it shall still open Add Offer

  Scenario: Nested overlays keep the action hidden until the last one closes
    Given an overlay bottom sheet is open
    When a second overlay bottom sheet opens and then closes
    Then the create-offer floating action button shall remain hidden
    And it shall reappear only after the first sheet closes
