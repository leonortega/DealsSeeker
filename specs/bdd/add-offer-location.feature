Feature: Add Offer location suggestions and mini map
  As a user
  I want live location suggestions and map preview
  So that I can quickly set the exact offer location

  Scenario: Initial GPS location and map marker on view open
    Given the user opens Add Offer view
    When GPS location is available
    Then the location textbox is prefilled with current location
    And the mini map shows the current location as a red point

  Scenario: Typeahead suggestions start from 3rd character
    Given the user is in Add Offer view
    When the user types fewer than 3 characters in location input
    Then no location suggestion list is shown
    When the user types at least 3 characters in location input
    Then location suggestions are shown in a selectable list

  Scenario: Selecting a suggestion updates textbox and mini map
    Given location suggestions are shown for the current input
    When the user selects one suggestion from the list
    Then the location textbox value is set to the selected label
    And the selected location becomes the current draft location
    And the mini map preview shows the selected location as a red point

  Scenario: Confirm and edit button toggle
    Given Confirm Location is enabled
    And Edit Location is disabled
    When the user presses Confirm Location
    Then Confirm Location becomes disabled
    And Edit Location becomes enabled
    When the user presses Edit Location
    Then Edit Location becomes disabled
    And Confirm Location becomes enabled
