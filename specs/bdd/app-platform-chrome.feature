Feature: Platform-native navigation chrome
  As a user of DealsSeeker on iOS or Android
  I want native navigation controls
  So that the shell behaves like the platform while keeping the brand

  Scenario: Native tab bar with platform symbols
    Given the authenticated shell is displayed on iOS and Android
    When the tab bar is rendered
    Then each platform uses its native tab bar component
    And navigation icons come from that platform's symbol set
    And the active tint follows the active palette

  Scenario: Overlay destinations use native headers
    Given an overlay destination is opened
    When its screen is rendered
    Then the platform-native header shows its title and back affordance
    And the destination's own content heading is unchanged

  Scenario: Local Offers controls stay reachable
    Given the standard Offers view is displayed
    When its controls are rendered
    Then the presentation switch and help control remain visible
    And no second global title bar is added

  Scenario: Create action stays available
    Given the authenticated shell is displayed
    When no sheet is open
    Then a single Create action is visible outside the tab bar
    And it is hidden while a sheet is open
