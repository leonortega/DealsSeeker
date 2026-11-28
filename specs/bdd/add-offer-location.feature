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

  Scenario: Location search waits for a quiet period
    Given the user is typing a place name in the location input
    When characters arrive faster than the quiet period
    Then no lookup is issued until typing stops
    And only one lookup is issued for the final text

  Scenario: Repeated identical location searches reuse cached results
    Given a place search for a query has already returned results
    When the user searches for the same query again within the cache period
    Then the previously returned results are shown
    And no additional Photon call is made

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

  Scenario: Pin a point on the mini map to set the address
    Given the Add Offer mini map is visible
    When the user taps a point on the map
    Then a pin marker is shown at the tapped point
    And the draft location position becomes the tapped point
    And the location textbox shows the resolved address label for the tapped point
    And raw latitude and longitude values are not shown in the location UI

  Scenario: Pinned location requires confirmation before saving
    Given the user pinned a point on the map
    And Confirm Location is enabled
    When the user presses save
    Then the offer request is not sent
    And a location-confirmation validation error is shown

  Scenario: Pinned point without a resolvable address label
    Given the address lookup for the tapped point returns no label
    When the user taps a point on the map
    Then the draft location keeps the tapped point
    And the location textbox shows a generic label without numeric coordinates

  Scenario: Pin selection is available before a location is resolved
    Given no location has been resolved for the draft
    Then the Add Offer mini map is still shown and accepts pin selection

  Scenario: Pin selection in edit mode
    Given the user opens Add Offer view in edit mode for a user-owned offer
    When the user taps a point on the mini map
    Then the draft location is replaced by the tapped point
    And the location textbox shows the resolved address label for the tapped point

  Scenario: Address resolves when a map drag ends
    Given the Add Offer mini map is visible
    When the user drags the map and keeps moving
    Then no address lookup is issued during the drag
    When the drag ends
    Then one address lookup is issued for the final map center
    And the pin and location textbox show that resolved location

  Scenario: Searching and no-results feedback
    Given the user typed at least 3 characters in the location input
    When the location lookup is in flight
    Then a searching indicator is shown in the location section
    When the lookup returns no results
    Then a no-results message is shown in the location section

  Scenario: Search failure offers retry and keeps the draft location
    Given a location is selected for the draft
    When the location lookup fails
    Then an error with a retry path is shown
    And the current draft location is unchanged

  Scenario: Disabled location controls cannot be pressed
    Given Confirm Location has been pressed
    Then Confirm Location is disabled and not operable
    And Edit Location is enabled
    When assistive technology inspects Confirm Location
    Then its disabled state is announced

  Scenario: Missing location is rejected without a substituted coordinate
    Given an offer submission has no location
    When the submission is validated
    Then it is rejected with a field-level location error
    And no fabricated coordinate is stored or displayed
