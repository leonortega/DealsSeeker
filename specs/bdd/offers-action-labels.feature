Feature: Visible labels for offer actions
  As a deal hunter using one hand on a phone
  I want every offer action to be labelled
  So that I never have to guess what an icon does

  Scenario: Phone presentation shows action labels
    Given an offer is displayed on a phone in portrait
    When the action controls are rendered
    Then each action shows a visible text label
    And the directions action is the only waypoint-accented action

  Scenario: Large text keeps actions labelled
    Given the system text size is set to 150 percent or higher
    When the action controls are rendered
    Then each action is either visibly labelled or reachable through a visibly labelled disclosure
    And no label clips or overlaps another control

  Scenario: Short viewport uses a labelled disclosure
    Given the available vertical space is too short for action captions
    When the action rail is rendered
    Then secondary actions sit behind one visibly labelled control
    And its entries carry text labels and remain independently tappable
    And every action remains labelled for assistive technology

  Scenario: One vocabulary across all offer surfaces
    Given an offer appears on a card, in the feed, in favorites and in the detail sheet
    When the actions are rendered on each surface
    Then Directions, Favorite, Comments, Available? and Report use the same label and glyph everywhere
    And the actions appear in the same relative order on every surface

  Scenario: Immersive rail limits visible actions to four
    Given an offer exposes more than four actions in the immersive rail
    When the rail is rendered
    Then at most four actions are visible
    And the remaining actions sit behind one control labelled More
    And the actions inside More keep the canonical order

  Scenario: Offer rail is the sole exception to the platform symbol vocabulary
    Given the offer action rail and shell chrome controls are rendered on both platforms
    When their glyphs are displayed
    Then the rail uses only this vocabulary
    And the shell chrome uses the one platform symbol vocabulary
    And no rail glyph is reused as a second chrome vocabulary

  Scenario: Every action has one canonical label, role, state and order
    Given an offer appears on a card, in the feed, in favorites and in the detail sheet
    When assistive technology traverses the actions on each surface
    Then each action shall announce the same canonical name, role and state everywhere
    And the actions shall keep the same relative order on every surface

  Scenario: No surface-specific assistive-technology value
    Given the same offer action is rendered on two different surfaces
    When its announced name, role and state are read
    Then no announced value shall differ between the surfaces
    And the same shall hold when the action sits inside a disclosure

  Scenario: Saved-offer removal uses a canonical label and state
    Given a saved offer is listed in My Favorites
    When the removal action is rendered and read by assistive technology
    Then it shall be labelled Remove favorite
    And it shall be announced distinctly from the favorite toggle
    And its announced state shall match the canonical vocabulary

  Scenario: Immersive rail uses Material 3 action components
    Given the immersive action rail is displayed
    When the actions are rendered
    Then each action is a Material 3 button or icon-button component
    And no action remains an authored custom pressable

  Scenario: Material 3 components keep canonical labels, roles and states
    Given the Android font scale is set to 200 percent
    And the same action appears in the rail and on a card
    When assistive technology traverses both surfaces
    Then each announces the same canonical name, role and state
    And the action keeps a 48 by 48 dp target on both surfaces
