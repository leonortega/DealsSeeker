Feature: Accessible control semantics across contribution, account, and feedback surfaces
  As a user relying on assistive technology
  I want every control to be announced by name, role, and state
  So that I can complete contribution and account tasks independently

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
    When assistive technology traverses the surface
    Then the decorative glyph is not announced as meaningful content

  Scenario: Localized labels keep their semantics
    Given the active language is not the source language
    When a labelled control is rendered
    Then its accessibility label is expressed in the active language
    And its role and state are unchanged
