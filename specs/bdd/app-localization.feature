Feature: App localization and language override
  As a user
  I want the app language to follow my locale with manual control
  So that I can use the app in my preferred language

  Scenario: Default language value is the system language
    Given no manual language override exists
    And the device locale is set to Spanish
    When the app starts
    Then the app language is set to Spanish

  Scenario: Language override updates UI and dictionaries
    Given app language is English
    When the user selects French in settings
    Then UI strings switch to French resources
    And search and tag suggestion dictionaries switch to French resources

  Scenario: Language change from menu applies instantly
    Given app language is English
    When the user chooses Spanish from the menu language control
    Then visible UI text in the current view switches to Spanish immediately
    And search and tag suggestion dictionaries switch to Spanish immediately

  Scenario: Missing key falls back to default language
    Given selected language resources are missing a UI key
    When the UI element is rendered
    Then the fallback language value is shown
