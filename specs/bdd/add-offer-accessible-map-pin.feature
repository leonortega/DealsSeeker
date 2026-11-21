Feature: Accessible map pin placement
  As a community contributor using assistive technology
  I want to place the offer pin without a pointer gesture
  So that I can contribute an accurate location independently

  Scenario: Set the pin at the map center without a pointer gesture
    Given the Add Offer mini map is displayed with a draft location
    When the user activates the set-pin-at-center action
    Then the draft location is set to the map center
    And the location label is updated to the resolved human-readable label

  Scenario: Accessible action matches a direct map selection
    Given a point is displayed at the center of the mini map
    When the user activates the set-pin-at-center action
    Then the resulting draft location matches the location that a direct selection of that point would produce

  Scenario: Coordinate privacy is preserved
    Given the user has set the pin through the accessible action
    When the location section is displayed
    Then no raw latitude or longitude value is shown as text
    And the draft still holds the coordinates needed for persistence

  Scenario: Other draft content is preserved
    Given the draft already has a description and tags
    When the user adjusts the pin with the accessible action
    Then the description and tags remain unchanged
