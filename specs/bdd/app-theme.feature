Feature: Theme behavior with Material 3 roles and verified appearances
  As a user
  I want the app theme to follow my device with optional override
  So that readability, contrast and preference are respected in all six seed and appearance sets

  Scenario: App uses system appearance by default
    Given no manual theme override exists
    And the device is set to dark appearance
    When the user opens the app
    Then the app uses the dark Material 3 scheme

  Scenario: Manual override supersedes system appearance
    Given device appearance is dark
    And the user selects light appearance in app settings
    When the user opens or resumes the app
    Then the app uses the light Material 3 scheme

  Scenario: User resets to system default
    Given a manual theme override exists
    When the user selects use system appearance
    Then app appearance follows the current OS preference

  Scenario: User changes appearance from My Account
    Given the app is using the light appearance
    When the user selects dark appearance from the My Account theme control
    Then the current view switches to dark appearance immediately

  Scenario: Every surface uses the active Material 3 scheme
    Given the app is using dark appearance
    When the user views the immersive presentation, the navigation surface and the Offers views
    Then every surface uses the active role values and the shared Material 3 component styles
    And no authored surface sits outside the scheme

  Scenario: Immersive overlay stays legible in both appearances
    Given the app uses the light appearance
    When the immersive presentation renders overlay text and controls
    Then they use the active on-surface roles and remain legible
    And the same roles are used in the dark appearance

  Scenario: Chrome colors use Material 3 roles only
    Given the app uses any seed variant in light or dark appearance
    When navigation, immersive text and a status message are rendered
    Then their colors come from the active Material 3 roles
    And no raw hex literal or fixed-backdrop token is used for chrome

  Scenario: Startup surface follows system appearance
    Given the device is set to dark appearance
    When the native startup surface is shown
    Then it uses a dark background variant
    And the light appearance keeps its own background

  Scenario: Status bar follows the presentation
    Given the app is in a light, dark or immersive presentation
    When the surface is rendered
    Then the status bar content stays legible against that surface
    And the style is verified on device per route

  Scenario: Both appearances are first-class on every screen
    Given every screen is rendered once in the light appearance and once in the dark appearance
    When the appearance audit is reviewed
    Then each screen is designed and tested for both appearances
    And neither appearance is a simple inversion of the other

  Scenario: Material 3 roles resolve both appearances
    Given the app renders buttons, surfaces, outlines and error states
    When the light and dark appearances are compared
    Then colors come from Material 3 roles that resolve each appearance
    And no raw hex literal replaces a role

  Scenario: Dynamic color falls back to a static scheme
    Given the device supports dynamic color and then does not
    When the theme is applied in each case
    Then the same Material 3 roles and contrast guarantees hold
    And both paths are verified

  Scenario: Elevation uses tonal surface levels
    Given a raised surface is rendered
    When its elevation is shown
    Then it uses a standard Material 3 tonal surface level
    And no arbitrary or authored drop shadow is used

  Scenario: Screen-by-screen audit evidence covers landscape and foldables
    Given a theming audit is performed
    When device captures are reviewed
    Then every screen appears in both appearances
    And landscape and both foldable postures are included where targeted

  Scenario: Contrast is measured in both appearances
    Given foreground text and control glyphs are rendered in both appearances
    When they are measured against their role surfaces
    Then they meet the accessibility contrast thresholds in both appearances
    And the evidence is recorded with the audit

  Scenario: Every seed maps to a complete M3 role set
    Given all three seed variants in both light and dark appearances
    When a primary action, a surface, a chip, an outline and an error state are rendered in each
    Then every color role used by those components resolves to a value derived from that variant's seed
    And no role used by a rendered component is left unresolved

  Scenario: All six seed and appearance sets keep verified contrast
    Given the three seeds in light and dark appearances
    When text and essential control glyphs are measured on their role surfaces
    Then they meet the recorded contrast thresholds in each of the six sets
    And the measurements for all six sets are part of the audit evidence

  Scenario: Material 3 roles govern every surface
    Given generated surface roles for any seed variant
    When the navigation surface and the immersive presentation are rendered
    Then they use the active Material 3 surface roles
    And no authored night-footer surface or fixed backdrop replaces them

  Scenario: No second accent language is introduced
    Given a seed variant in either appearance
    When primary, secondary, tertiary and error roles are used across a view
    Then they carry only their Material 3 assigned meanings
    And no additional brand accent color is introduced

  Scenario: Replacement preserves behavior and privacy
    Given the prior brand palette authority is retired
    When theme behavior is exercised across all views
    Then copy, behavior and coordinate privacy remain unchanged
