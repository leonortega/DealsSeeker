Feature: Accessible control sizes and reading sizes on touch surfaces
  As a user navigating with one hand on a phone
  I want controls and labels large enough to hit and read, and to follow my reading size
  So that I do not mis-tap or miss information

  Scenario: Footer tabs meet the iOS touch target floor
    Given the standard application navigation surface is displayed on iOS
    When a destination tab is rendered
    Then its touch target is at least 44 by 44 pt
    And adjacent tabs keep clear breathing room

  Scenario: Footer tabs meet the Android touch target floor
    Given the standard application navigation surface is displayed on Android
    When a destination tab is rendered
    Then its touch target is at least 48 by 48 dp
    And adjacent tabs are separated by at least 8 dp

  Scenario: Search and filter controls meet the platform touch floor
    Given the Offers view search panel is displayed
    When a coverage radius chip or a search action is rendered
    Then its touch target is at least 44 pt on iOS and 48 dp on Android in height

  Scenario: Immersive controls meet the platform touch floor
    Given the immersive offers feed is displayed
    When the search control or the photo navigation controls are rendered
    Then each touch target is at least 44 by 44 pt on iOS
    And each touch target is at least 48 by 48 dp on Android

  Scenario: Metadata labels stay legible at default reading size
    Given any control caption or metadata label is rendered
    When the default reading size is active
    Then the label size is at least 11 units

  Scenario: Footer labels reflow at large reading size
    Given the standard application navigation surface is displayed
    When a large reading size is active
    Then each default destination label grows and wraps rather than being hidden or truncated
    And the platform touch floor still holds

  Scenario: Text follows the system reading size beyond 1.2x
    Given the system reading size is set to twice the default
    When a control caption is rendered
    Then its text grows accordingly
    And no fixed cap limits growth at 1.2 times the default

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
    When the Offers header or the immersive top bar is rendered
    Then the presentation control, the feed tabs, and the search control are all visible
    And none of them overlaps another

  Scenario: Long localized label at the largest Android reading size
    Given a long localized destination label at the largest system reading size
    When the navigation surface is rendered
    Then the label wraps within or around its target rather than disappearing
    And the target remains at least 48 by 48 dp
    And the control keeps its accessible name

  Scenario: iOS accessibility text size reflows labels
    Given iOS is at an accessibility reading size
    When destination labels are rendered
    Then labels reflow into multiple lines where needed
    And the targets remain at least 44 by 44 pt
