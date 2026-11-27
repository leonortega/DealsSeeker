Feature: Read-only guest discovery in Offers
  As an unauthenticated visitor
  I want to browse nearby offers without an account
  So that I can discover deals before deciding to sign in

  Scenario: Guest browses the feed and the map
    Given there is no active authenticated session
    And the user chose to browse nearby without an account
    When the Offers view opens
    Then the offers feed is visible read-only
    And the offers map is reachable and viewable

  Scenario: Guest searches and widens the coverage area
    Given a guest is on the Offers view
    When the guest enters a search query and changes the coverage radius
    Then the offer list and map markers update for the query and radius
    And the guest remains in the read-only session

  Scenario: Guest opens offer details and photos
    Given a guest is viewing an offer in the feed or map
    When the guest opens the offer details and swipes through its photos
    Then the details and photos are displayed
    And no sign-in is required to view them

  Scenario: Guest attempt to favorite prompts sign-in without losing context
    Given a guest is viewing offers with query "coffee" and a 1000 meter radius
    When the guest attempts to favorite an offer
    Then no favorite change is made
    And a sign-in prompt is shown
    And the query, radius, presentation mode, and open offer are preserved

  Scenario: Guest vote, comment, or report is gated behind sign-in
    Given a guest is on an offer detail view
    When the guest attempts a vote, a comment, or a report
    Then the action does not take effect
    And a sign-in prompt is shown

  Scenario: Guest add-offer action is gated behind sign-in
    Given a guest is on the Offers view
    When the guest selects the add-offer action
    Then a sign-in prompt is shown instead of the Add Offer view

  Scenario: Guest signs in and returns to the prior context
    Given a guest was prompted to sign in while viewing offer "off-100" with query "coffee" and a 1000 meter radius in the immersive feed
    When the guest signs in successfully
    Then the guest session ends and an authenticated session begins
    And the immersive presentation is restored
    And the query "coffee", the 1000 meter radius, and offer "off-100" are restored

  Scenario: Guest cancels sign-in and keeps the discovery context
    Given a guest was prompted to sign in while viewing an offer with an active query
    When the guest cancels the prompt
    Then the guest session remains active
    And the query, radius, presentation mode, and open offer are unchanged

  Scenario: Guest fails sign-in and keeps the discovery context
    Given a guest was prompted to sign in while viewing an offer with an active query
    When the guest submits invalid credentials
    Then the guest session remains active
    And the query, radius, presentation mode, and open offer are unchanged

  Scenario: Guest state is plainly indicated in both presentations
    Given a guest is in the Offers view
    When the standard view or the immersive feed is rendered
    Then a plain indication shows that browsing is read-only
    And no raw latitude or longitude value is displayed

  Scenario: Guest with no offers sees the unfiltered empty guidance
    Given a guest is on the Offers view with no query and no favorites filter active
    When a search completes with no offers
    Then the unfiltered empty-state guidance is displayed in the current presentation

  Scenario: Guest direct link opens an offer read-only
    Given there is no active authenticated session
    When the guest follows a link that opens an offer detail
    Then the offer detail is displayed read-only
    And no sign-in is required to view it

  Scenario: Guest does not get an authenticated session on relaunch
    Given a guest has browsed offers without an account
    When the app is relaunched
    Then no authenticated session is restored
    And contribution actions remain gated behind sign-in
