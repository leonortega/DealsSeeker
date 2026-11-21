Feature: Adaptive touch, text, zoom, and motion behavior
  As a user on a phone or tablet with non-default accessibility settings
  I want controls, text, maps, and motion to adapt to my settings
  So that I can complete every task without clipped content or unwanted animation

  Scenario: Every control meets the touch floor
    Given any supported screen is displayed
    When a tappable control is rendered
    Then its touch target is at least 44 by 44 units
    And the control remains distinguishable from its neighbors

  Scenario: Body text survives large text scaling
    Given the system text size is set to twice the default
    When an offer description or detail body is displayed
    Then the text wraps without clipping or overlapping
    And the primary actions remain reachable

  Scenario: Embedded map can be pinch-zoomed
    Given a map is displayed inside the application
    When the user pinches the map
    Then the map zooms in or out according to the gesture

  Scenario: Reduced motion replaces animation
    Given the system requests reduced motion
    When a transition or animated gallery scroll would occur
    Then the state change is presented without the animated motion
    And the same information and controls remain available

  Scenario: Decorative captions yield to a short viewport
    Given the available vertical space is insufficient for decorative action captions
    When the offer actions are displayed
    Then the captions are omitted
    And every action remains labelled for assistive technology

  Scenario: Reduced motion in both themes and landscape
    Given reduced motion is enabled and the device is in landscape
    When a surface is rendered in either theme
    Then the touch floor and text scaling still hold
