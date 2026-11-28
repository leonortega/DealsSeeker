Feature: Adaptive touch, text, zoom, motion and font-scale verification
  As a user on an Android phone, tablet or foldable with non-default accessibility settings
  I want controls, text, maps, captions and motion to adapt up to 200 percent font
  So that I can complete every task without clipped content, hidden labels or unwanted animation

  Scenario: Every control meets the Android touch floor
    Given any supported screen is displayed
    When a tappable control is rendered
    Then its touch target is at least 48 by 48 dp
    And adjacent targets keep at least 8 dp of separation
    And the control remains distinguishable from its neighbors

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
    Then the 48 dp touch floor and text scaling still hold

  Scenario: Navigation labels scale without breaking
    Given the system reading size is set to 150 percent
    When the navigation surface, presentation switch and feed tabs are rendered
    Then their labels remain readable on one line or wrap at word boundaries
    And no label overlaps an adjacent control

  Scenario: Tablet rail preserves touch floor and text scale
    Given the app is rendered at an expanded tablet width
    When the navigation rail or drawer is displayed with a large reading size
    Then its targets keep the 48 by 48 dp floor and 8 dp separation
    And its labels reflow without clipping
    And the compact bottom bar is not shipped unchanged

  Scenario: 200 percent font scale verification
    Given the Android font scale is set to 200 percent
    When body text, captions and navigation labels are rendered on any surface
    Then none are clipped or overlapped
    And verification evidence captures the result

  Scenario: Adaptivity holds at 200 percent in landscape and foldable postures
    Given the font scale is 200 percent and reduced motion is enabled
    When the app is used in landscape and in both foldable postures where a foldable is a target
    Then touch floors, text reflow and reduced-motion behavior still hold
    And every primary control remains reachable

  Scenario: Material 3 components keep touch floors at 200 percent
    Given the Android font scale is set to 200 percent
    And app bar, coverage selection and offer actions are rendered as Material 3 components
    When each target is measured
    Then each keeps a 48 by 48 dp target and 8 dp separation

  Scenario: Material 3 overflow keeps actions labelled
    Given an offer action rail uses a Material 3 component for its overflow control
    And the viewport is too short for inline captions
    When the rail is rendered at 150 percent text
    Then secondary actions remain behind one visibly labelled disclosure
    And every action stays independently tappable and labelled
