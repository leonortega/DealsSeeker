Feature: Accessible control sizes, reading sizes and contrast on touch surfaces
  As a user navigating Android with one hand and with TalkBack
  I want controls and labels large enough to hit and read, with proven contrast, up to 200 percent font
  So that I do not mis-tap, miss information, or lose a control out of traversal

  Scenario: Footer tabs meet the Android touch floor
    Given the standard application navigation surface is displayed on Android
    When a destination tab is rendered
    Then its touch target is at least 48 by 48 dp
    And adjacent tabs are separated by at least 8 dp

  Scenario: Search and filter controls meet the touch floor
    Given the Offers view search panel is displayed
    When a coverage radius chip or a search action is rendered
    Then its touch target is at least 48 dp in height

  Scenario: Immersive controls meet the touch floor
    Given the immersive offers feed is displayed
    When the search control or the photo navigation controls are rendered
    Then each touch target is at least 48 by 48 dp

  Scenario: Metadata labels stay legible at default reading size
    Given any control caption or metadata label is rendered
    When the default reading size is active
    Then the label size is at least 11 units

  Scenario: Footer labels reflow at large reading size
    Given the standard application navigation surface is displayed
    When a large reading size is active
    Then each default destination label grows and wraps rather than being hidden or truncated
    And the 48 by 48 dp touch floor still holds

  Scenario: Text follows the system reading size beyond 1.2x
    Given the system reading size is set to twice the default
    When a control caption is rendered
    Then its text grows accordingly
    And no fixed cap limits growth at 1.2 times the default

  Scenario: 200 percent font causes no clipping
    Given the Android font scale is set to 200 percent
    When a control, caption or metadata value is rendered on any shell or offer surface
    Then the text is fully visible without clipping or overlap
    And the control's accessible name remains available
    And device evidence at 200 percent captures the result

  Scenario: Contrast is measured in both appearances
    Given the app is rendered in the light appearance and again in the dark appearance
    When foreground text and control glyphs are measured against their surfaces
    Then body text reaches at least 4.5 to 1 contrast
    And large text and essential UI components reach at least 3 to 1
    And the measured evidence covers both appearances

  Scenario: TalkBack traversal reaches every control at default and 200 percent
    Given TalkBack is enabled at the default and again at 200 percent font scale
    When the user traverses a surface with touch exploration
    Then every control in traversal order is reachable and announces its name
    And no control is clipped out of the traversal
    And sign-off evidence records both scales

  Scenario: Floating action does not cover other controls
    Given the Offers view is displayed in either presentation
    When the create-offer floating action is rendered
    Then it does not overlap any other tappable control
    And every action behind it remains independently tappable

  Scenario: Floating action does not cover controls at large reading size
    Given the Offers view is displayed with a large reading size
    When the user scrolls to the bottom of the content
    Then the create-offer floating action does not cover the search action
    And every control beneath it remains independently tappable

  Scenario: Header controls stay visible on a narrow phone
    Given the screen width is the narrowest supported phone width
    When the Offers top bar or the immersive top bar is rendered
    Then the presentation control, the feed tabs, and the search control are all visible
    And none of them overlaps another

  Scenario: Long localized label at the largest reading size
    Given a long localized destination label at 200 percent font scale
    When the navigation surface is rendered
    Then the label wraps within or around its target rather than disappearing
    And the target remains at least 48 by 48 dp
    And the control keeps its accessible name

  Scenario: Material 3 components preserve the touch floor
    Given an app bar action, a coverage option, an offer action and an offer card are rendered as Material 3 components on Android
    When each target is measured
    Then each presents at least a 48 by 48 dp target with 8 dp separation

  Scenario: Material 3 components preserve names and states at 200 percent
    Given the Android font scale is set to 200 percent
    And controls are rendered as Material 3 components
    When TalkBack traverses them
    Then every control keeps its accessible name, role and state
    And no caption is dropped solely because of the component's default
