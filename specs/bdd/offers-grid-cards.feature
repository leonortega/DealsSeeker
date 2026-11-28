Feature: Compact responsive offer grid cards
  As a user
  I want offers displayed as consistent compact cards
  So that browsing remains compact and scannable

  Scenario: Offer tiles render in compact consistent format
    Given offers are available in the feed
    When the grid is rendered
    Then each offer tile is displayed as a compact card with consistent structure
    And the image frame and content layout are consistent across visible tiles

  Scenario: Grid remains visually consistent across viewport changes
    Given offers are available
    When the viewport width changes
    Then image framing stays visually consistent
    And the column count adjusts responsively

  Scenario: Maintenance actions sit behind a labelled control
    Given an offer card is displayed
    When the card actions are rendered
    Then only the three primary actions are visible
    And availability voting and reporting are reachable through one labelled control
    And the entries inside it carry text labels

  Scenario: Card actions stack on a narrow mobile viewport
    Given offers are available on a narrow mobile viewport
    And an offer has localized action labels longer than one word
    When the card is rendered
    Then the favorite, directions, and comments actions each occupy a full-width row
    And each label wraps at word boundaries without breaking mid-word

  Scenario: Offer tiles follow a Material 3 card structure
    Given offers are available in the feed
    When the grid is rendered
    Then each tile shall follow a Material 3 card pattern with an image area and a content area
    And the structure shall stay consistent across the grid

  Scenario: Compact actions keep their Material 3 affordance at narrow widths
    Given offers are available on a narrow mobile viewport
    When the card is rendered
    Then the primary actions shall follow Material 3 button patterns with their announced names, roles and states unchanged
    And maintenance actions shall stay behind the one labelled disclosure

  Scenario: A long localized label stays inside the card pattern
    Given an offer has a localized action label longer than one word
    When the card is rendered at a narrow width
    Then the label shall wrap within the Material 3 card without overflow
    And the action shall remain tappable

  Scenario: Cards use Material 3 card defaults
    Given the offer grid is rendered
    When each card's shape and elevation are determined
    Then Material 3 card defaults apply
    And no brand-only shadow or pill exception overrides them

  Scenario: Card defaults keep the touch floor and semantics
    Given the Android font scale is set to 200 percent
    And an offer card has a long localized action label
    When the card is rendered at a narrow width
    Then the action keeps a 48 by 48 dp target and its announced name, role and state
    And the label wraps within the card without overflow
