Feature: Accessible control sizes on touch surfaces
  As a user navigating with one hand on a phone
  I want controls and labels large enough to hit and read
  So that I do not mis-tap or miss information

  Scenario: Footer tabs meet the touch target floor
    Given the standard application footer is displayed
    When a footer tab is rendered
    Then its touch target is at least 44 by 44 units
    And adjacent tabs are separated by at least 8 units

  Scenario: Search and filter controls meet the touch target floor
    Given the Offers view search panel is displayed
    When a coverage radius chip or a search action is rendered
    Then its touch target is at least 44 units in height

  Scenario: Immersive controls meet the touch target floor
    Given the immersive offers feed is displayed
    When the search control or the photo navigation controls are rendered
    Then each touch target is at least 44 by 44 units

  Scenario: Metadata labels stay legible at default text size
    Given any control caption or metadata label is rendered
    When the default text size is active
    Then the label size is at least 11 units

  Scenario: Floating action does not cover other controls
    Given the Offers view is displayed in either presentation
    When the create-offer floating action is rendered
    Then it does not overlap any other tappable control
    And every action behind it remains independently tappable

  Scenario: Header controls stay visible on a narrow phone
    Given the screen width is the narrowest supported phone width
    When the Offers header or the immersive top bar is rendered
    Then the presentation control, the feed tabs, and the search control are all visible
    And none of them overlaps another
