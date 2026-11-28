Feature: Landscape and foldable layout conformance
  As a user holding an Android device in landscape or on a foldable
  I want every control to stay reachable despite the short viewport, system bars and folds
  So that discovery and contribution work in any posture, including at 200 percent font

  Scenario: Phone landscape keeps every primary control reachable
    Given the app is in landscape on a phone
    When the Offers view is displayed
    Then every primary discovery and action control is visible and independently tappable
    And no core function is hidden solely because the viewport is short

  Scenario: Landscape bottom bar keeps its touch floor
    Given the app is in landscape at compact width
    When the bottom navigation surface is rendered
    Then its targets are at least 48 by 48 dp with 8 dp separation
    And it does not overlap content or system bars

  Scenario: Tablet landscape uses a rail and extra columns
    Given the app is in landscape at an expanded tablet width
    When the Offers view is displayed
    Then the navigation surface is a rail or drawer rather than a bottom bar
    And the offer grid uses additional columns with the same card composition

  Scenario: Keyboard does not cover the focused field
    Given the app is in landscape with the on-screen keyboard open
    When the user focuses a field near the bottom of a form or sheet
    Then the field and its primary action remain visible
    And content reflows when the keyboard opens and closes

  Scenario: Landscape sheet and dialog controls stay reachable
    Given a sheet or dialog is open in landscape
    When its content is rendered
    Then its close and action controls remain reachable
    And it does not extend behind a system bar or a fold boundary

  Scenario: Foldable postures keep controls reachable
    Given the app runs on a foldable device
    When the device moves from a folded to an unfolded posture in landscape
    Then every primary control remains reachable in both postures
    And no control or label is hidden by a hinge or fold
    And the user's place is preserved across the posture change

  Scenario: 200 percent font does not clip landscape content
    Given the Android font scale is set to 200 percent in landscape
    When labels, captions and metadata are rendered
    Then none are clipped
    And any overflowing captions move into a visibly labelled disclosure

  Scenario: TalkBack traversal is signed off in landscape
    Given TalkBack is enabled in landscape at the default and 200 percent font scales
    When the user traverses a surface
    Then every control is reachable in a sensible order and announces its name
    And sign-off evidence records both scales

  Scenario: Landscape evidence covers appearances and device classes
    Given landscape conformance is reviewed
    When evidence is captured
    Then both appearances are shown on a phone and, where targeted, at tablet width
    And both foldable postures are included where a foldable is a target
