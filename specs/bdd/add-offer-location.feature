Feature: Add Offer location suggestions and mini map
  As a user
  I want live location suggestions and map preview
  So that I can quickly set the exact offer location

  Scenario: Initial GPS location and map marker on view open
    Given the user opens Add Offer view
    When GPS location is available
    Then the location textbox is prefilled with the nearest resolved address label
    And raw latitude and longitude values are not shown in location UI text
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

  Scenario: Coordinates are persisted but hidden from users
    Given a location is selected for the Add Offer draft
    When the location section is rendered
    Then the UI shows only human-readable location labels
    And latitude/longitude are kept for persistence only

  Scenario: Confirm and edit button toggle
    Given Confirm Location is enabled
    And Edit Location is disabled
    When the user presses Confirm Location
    Then Confirm Location becomes disabled
    And Edit Location becomes enabled
    When the user presses Edit Location
    Then Edit Location becomes disabled
    And Confirm Location becomes enabled

  Scenario: Save is blocked when location is not confirmed
    Given the draft has an auto-populated or selected location
    And Confirm Location is enabled
    When the user presses save
    Then the offer request is not sent
    And a location-confirmation validation error is shown

  Scenario: Edit mode map shows the stored offer location
    Given the user opens Add Offer view in edit mode for a user-owned offer
    And the owned offer has a stored location in the database
    When the edit draft finishes loading
    Then the location textbox shows the stored location label
    And the mini map preview shows the stored offer location
