Feature: Device class and orientation
  As a user on a phone, tablet, or in landscape
  I want the layout to remain usable at my screen size
  So that discovery still works without a wide desktop reflow

  Scenario: Wider screens gain columns without a new layout
    Given the app is running on a tablet-sized screen
    When the Offers view is displayed
    Then the offer grid uses additional columns
    And the phone-first composition is preserved

  Scenario: Landscape keeps controls reachable
    Given the device is in landscape orientation
    When the user views an offer
    Then primary discovery and action controls are not clipped or overlapped
    And no core functionality is hidden

  Scenario: A narrow window uses the compact layout
    Given the available width is phone-sized
    When the Offers view is displayed
    Then the compact layout is used
    And controls remain reachable

  Scenario: Wide footer stays compact and centered
    Given the device is in landscape orientation
    When the shared footer is rendered
    Then it shall not stretch across the full screen width
    And it shall be horizontally centered
    And discovery controls outside the footer shall remain visible
