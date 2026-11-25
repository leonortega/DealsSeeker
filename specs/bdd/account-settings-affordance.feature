Feature: Account settings affordance and profile layout
  As a user managing my account
  I want settings controls that look tappable and an email I can read
  So that I can change preferences without guessing

  Scenario: Settings controls look interactive
    Given the user is on My Account
    When the settings panel is displayed
    Then each setting control shows a visible change affordance
    And its accessible name includes the current value

  Scenario: Long email stays readable
    Given the account email is longer than the profile details width
    When the profile is displayed
    Then the email does not leave a stranded trailing fragment at normal text size
    And the logout action remains on its own line
