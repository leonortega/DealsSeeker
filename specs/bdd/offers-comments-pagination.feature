Feature: Paged offer comments
  As an authenticated user
  I want offer comments to be loaded in pages
  So that I can read the conversation without loading every comment at once

  Scenario: Comments are loaded with the default limit
    Given an authenticated user opens the comments section for an offer
    And the offer has more than 20 published comments
    When the comments list is requested without paging values
    Then the response shall contain at most 20 comments
    And the hasMore flag shall be true
    And a next cursor value shall be present

  Scenario: Maximum limit is accepted
    Given an authenticated user opens the comments section for an offer
    When the comments list is requested with a limit of 100
    Then the request shall be accepted
    And the response shall contain at most 100 comments

  Scenario: Limit above the maximum is rejected
    Given an authenticated user opens the comments section for an offer
    When the comments list is requested with a limit of 101
    Then the request shall be rejected with a validation error
    And no comments shall be returned

  Scenario: Limit below the minimum is rejected
    Given an authenticated user opens the comments section for an offer
    When the comments list is requested with a limit of 0
    Then the request shall be rejected with a validation error
    And no comments shall be returned

  Scenario: Unrecognised cursor is rejected
    Given an authenticated user opens the comments section for an offer
    When the comments list is requested with an unrecognised after cursor
    Then the request shall be rejected with a validation error
    And no comments shall be returned

  Scenario: Next page continues the ordering without duplicates
    Given an authenticated user opened the comments section for an offer
    And the offer has more than 20 published comments
    When the user requests the next page using the next cursor value
    Then the comments shall continue from oldest to newest
    And no comment shall appear on both the first and the second page

  Scenario: Requesting more comments than exist exhausts the list
    Given an authenticated user opened the comments section for an offer
    And the offer has 3 published comments
    When the user requests the next page with a limit of 100
    Then the remaining comments shall be returned
    And the hasMore flag shall be false
    And no next cursor value shall be present

  Scenario: Offer without comments yields an empty page
    Given an authenticated user opens the comments section for an offer
    And the offer has no published comments
    When the comments list is requested
    Then the response shall contain no comments
    And the hasMore flag shall be false
    And no next cursor value shall be present

  Scenario: Comments section exposes the paging affordance
    Given an authenticated user opened the comments section for an offer
    And the offer has more comments than fit in a single page
    When the comments list is displayed
    Then the user shall be able to request the next page of comments
