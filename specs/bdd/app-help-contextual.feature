Feature: Contextual help entry points
  As a deal hunter who is stuck at a specific step
  I want help that opens right there with the relevant topic first
  So that I can keep my place and carry on without leaving the app

  Scenario: No-position state offers contextual help
    Given the no-position state of APP.LOCATION.UNAVAILABLE.001 is displayed
    When the user selects its contextual help affordance
    Then the same help surface opens with finding deals shown first
    And the user remains in the current view

  Scenario: Empty or filter-clearing results offer contextual help
    Given an empty-results or clear-filters state is displayed
    When the user selects its contextual help affordance
    Then the same help surface opens with finding deals shown first
    And the active query and filters are unchanged

  Scenario: Add Offer offers contextual help
    Given the user is in Add Offer with a draft in progress
    When the user selects its contextual help affordance
    Then the same help surface opens with contributing an offer shown first
    And the user remains in Add Offer with the draft unchanged

  Scenario: Report surface offers contextual help
    Given the report surface is open with a partially written message
    When the user selects its contextual help affordance
    Then the same help surface opens with reporting an offer shown first
    And the report surface and its message remain open

  Scenario: Sign-in guard offers contextual help
    Given a sign-in guard is shown for a gated contribution action
    When the user selects its contextual help affordance
    Then the same help surface opens with the topic for that action shown first
    And the sign-in prompt and preserved Offers context remain unchanged

  Scenario: Dismissing contextual help returns focus and preserves context
    Given contextual help was opened from any entry point
    When the user dismisses the help surface
    Then focus returns to the control that opened it
    And the underlying context is unchanged
    And only one help surface was used

  Scenario: Contextual help keeps the five essential topics
    Given contextual help was opened with a relevant topic first
    When the user reviews the help surface
    Then the same five topics of APP.HELP.001 are listed
    And no extra topic is added

  Scenario: Contextual help is announced and holds under localization and text scaling
    Given Spanish is active and the system text size is set to 200 percent
    When a contextual help affordance is displayed and opened
    Then the affordance and the help surface are announced by assistive technology
    And no text is clipped
    And no raw latitude or longitude value is visible

  Scenario: Add Offer fields carry inline guidance
    Given the Add Offer view is open with its location, description and tag fields
    When the user focuses each field
    Then short guidance is shown beside that field
    And the location guidance explains a confirmed location without showing coordinates
    And the field and its primary action stay usable

  Scenario: Report field carries inline guidance
    Given the report surface is open with a reason or message field
    When the user focuses that field
    Then guidance explains what to include and that sending needs explicit confirmation
    And the draft message stays editable

  Scenario: No-position state carries inline guidance
    Given the no-position state is displayed
    When the user reads its decision
    Then inline guidance explains how to provide a position or use an explicit override
    And no location-bound search is started by the guidance

  Scenario: Sign-in guard carries inline guidance
    Given a sign-in guard is shown for a gated contribution action
    When the user reads the guard
    Then inline guidance explains why sign-in is needed and that their place is preserved
    And the sign-in form and preserved context remain usable

  Scenario: Inline guidance collapses and stays attached
    Given inline guidance is shown for an active field
    When the user completes that field and moves to the next one
    Then the guidance for the completed field collapses
    And guidance for the newly active field may appear
    And each guidance is announced with its own field
    And no raw latitude or longitude value is shown
