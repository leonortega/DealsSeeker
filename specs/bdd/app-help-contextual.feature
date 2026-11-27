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
