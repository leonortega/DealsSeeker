Feature: Accessible control semantics across every surface
  As a user relying on TalkBack
  I want every control to announce its name, role and state with proven contrast
  So that I can complete every task independently at default and 200 percent font scale

  Scenario: Icon-only actions are announced by name and role
    Given a contribution or account screen is displayed
    When an icon-only action is rendered
    Then the action exposes the role of a button
    And the action exposes a meaningful label in the active language

  Scenario: Form fields are associated with their labels
    Given the user is on a login, registration, contribution, suggestion, or report form
    When a text entry field is rendered
    Then the field exposes a label that describes the expected input
    And a visible label adjacent to the field refers to the same field

  Scenario: Visual state is conveyed to assistive technology
    Given an offer is shown with an active favorite state
    And availability controls are disabled because the user already voted
    When those controls are rendered
    Then the favorite control exposes its selected state
    And the availability controls expose their disabled state

  Scenario: Decorative glyphs are not announced as content
    Given an image placeholder or decorative glyph is rendered
    When TalkBack traverses the surface
    Then the decorative glyph is not announced as meaningful content

  Scenario: Localized labels keep their semantics
    Given the active language is not the source language
    When a labelled control is rendered
    Then its accessibility label is expressed in the active language
    And its role and state are unchanged

  Scenario: Mutually exclusive options are announced as a group
    Given a settings surface with mutually exclusive options
    When TalkBack traverses those options
    Then the options are exposed inside a labelled group
    And each option exposes its selected state

  Scenario: Every shell and offer control exposes name, role and state
    Given shell chrome, offer cards, feed actions, a map and an overlay are displayed
    When TalkBack traverses each surface
    Then every interactive control announces a name, a role and its current state
    And no control relies on a visual cue alone

  Scenario: Contrast is measured in both appearances
    Given a screen is rendered in the light appearance and again in the dark appearance
    When its labels and control glyphs are measured against their surfaces
    Then the measured contrast meets the accessibility thresholds in both appearances
    And the evidence is recorded for theme sign-off

  Scenario: Semantics survive 200 percent font scale
    Given the Android font scale is set to 200 percent
    When a labelled control is rendered
    Then its label reflows without clipping
    And its name, role and state are unchanged

  Scenario: TalkBack traversal sign-off covers every surface
    Given TalkBack is enabled at the default and 200 percent font scales
    When each supported surface is traversed
    Then every control announces its name, role and state
    And sign-off evidence records the result for each surface and scale

  Scenario: Material 3 components keep name, role and state
    Given a shell action and an offer action are rendered as Material 3 components
    When TalkBack traverses them
    Then each announces the same name, role and state as the control it replaced

  Scenario: Material 3 radio selection exposes the selected state
    Given a coverage/distance group is rendered as Material 3 selection controls
    When an option is selected and assistive technology reads the group
    Then the group is labelled
    And the selected option exposes its selected state
    And no option relies on a visual cue alone
