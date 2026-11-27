Feature: Adaptive touch, text, zoom, and motion behavior
  As a user on a phone or tablet with non-default accessibility settings
  I want controls, text, maps, captions and motion to adapt to my settings
  So that I can complete every task without clipped content, hidden labels or unwanted animation

  Scenario: Every control meets the iOS touch floor
    Given any supported screen is displayed on iOS
    When a tappable control is rendered
    Then its touch target is at least 44 by 44 pt
    And the control remains distinguishable from its neighbors

  Scenario: Every control meets the Android touch floor
    Given any supported screen is displayed on Android
    When a tappable control is rendered
    Then its touch target is at least 48 by 48 dp
    And adjacent targets keep at least 8 dp of separation

  Scenario: Body text survives large text scaling
    Given the system reading size is set to twice the default
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

  Scenario: Action captions reflow into a labelled disclosure at large text
    Given the system reading size is at 150 percent of the default
    When an offer action rail is rendered
    Then captions that cannot fit inline reflow into a visibly labelled disclosure
    And no action caption is hidden solely to save space
    And every action remains independently tappable

  Scenario: Short viewport with large text keeps captions discoverable
    Given a short viewport and a large reading size
    When the offer actions are displayed
    Then their captions move into a labelled disclosure rather than being omitted
    And the disclosure has a reachable, labelled control

  Scenario: Reduced motion in both themes and landscape
    Given reduced motion is enabled and the device is in landscape
    When a surface is rendered in either theme
    Then the platform touch floors and text scaling still hold

  Scenario: Navigation labels scale without breaking
    Given the system reading size is set to 150 percent
    When the navigation surface, presentation switch and feed tabs are rendered
    Then their labels remain readable on one line or wrap at word boundaries
    And no label overlaps an adjacent control

  Scenario: Tablet rail preserves touch floor and text scale
    Given the app is rendered at an expanded tablet width
    When the navigation rail or drawer is displayed with a large reading size
    Then its targets keep the platform touch floors
    And its labels reflow without clipping
    And the compact bottom bar is not shipped unchanged
