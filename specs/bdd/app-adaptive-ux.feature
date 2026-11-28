Feature: Device class, orientation, foldable posture and font-scale adaptivity
  As a user on a phone, tablet, in landscape, or on a foldable
  I want the layout to remain usable at my screen size and posture
  So that discovery still works without a wide desktop reflow or clipped content

  Scenario: Wider screens gain columns and a navigation rail
    Given the app is running on a tablet-sized screen
    When the Offers view is displayed
    Then the offer grid uses additional columns
    And the navigation surface is a rail or drawer rather than a bottom bar
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
    Then it does not stretch across the full screen width
    And it is horizontally centered
    And discovery controls outside the footer remain visible

  Scenario: Tablet rail and N-column grid are verified together
    Given the app is rendered at an expanded tablet width
    When discovery is used
    Then the navigation rail or drawer exposes the same destinations as the phone layout
    And the offer grid uses multiple columns with the same card composition
    And device evidence records the result

  Scenario: Folded and unfolded postures keep controls reachable
    Given the app runs on a foldable device
    When the device is in a folded posture and then an unfolded posture
    Then every primary control remains reachable in both postures
    And no control or label is hidden by a hinge or fold boundary
    And a posture change reflows content without losing the user's place

  Scenario: Font-scale verification covers every device class
    Given font scale is at the default and again at 200 percent
    When phone, tablet and landscape layouts are reviewed
    Then no control or label is clipped in any layout
    And both foldable postures are included where a foldable is a target
