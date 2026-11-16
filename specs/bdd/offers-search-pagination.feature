Feature: Paged offer search results
  As a user
  I want offer search results to be delivered in pages
  So that I can browse long result sets without losing the map context

  Scenario: Search results use default paging values
    Given active offers exist matching the current query and radius
    And more matching offers exist than fit in a single page
    When the user executes the search without paging values
    Then the response carries page 1
    And the response carries page size 20
    And at most 20 offers are shown in the list
    And the hasMore flag is true when further matching offers exist

  Scenario: Maximum page size is accepted
    Given the user is on Offers view
    When the user requests a search with page size 50
    Then the request is accepted
    And the response carries page size 50
    And at most 50 offers are shown in the list

  Scenario: Page size above the maximum is rejected
    Given the user is on Offers view
    When the user requests a search with page size 51
    Then the request is rejected with a validation error
    And no search is performed

  Scenario: Page number below the minimum is rejected
    Given the user is on Offers view
    When the user requests a search with page 0
    Then the request is rejected with a validation error
    And no search is performed

  Scenario: Page size below the minimum is rejected
    Given the user is on Offers view
    When the user requests a search with page size 0
    Then the request is rejected with a validation error
    And no search is performed

  Scenario: Ordering is stable across page boundaries
    Given the user is on Offers view
    And a search matching more offers than fit in one page has been executed
    When the user requests page 1 and then page 2 for the same query and radius
    Then no offer appears on both pages
    And no matching offer is missing from the requested pages
    And the relative order of the offers matches the unpaged result order

  Scenario: Map markers are not affected by paging
    Given the user is on Offers view
    And a search matching offers across several businesses has been executed
    When the user requests page 2 for the same query and radius
    Then markers are shown for every business with a matching offer
    And the marker set is identical to the marker set of page 1

  Scenario: Empty result set returns empty page and no markers
    Given the user is on Offers view
    And no active offer matches the current query and radius
    When the user executes the search
    Then no offers are shown in the list
    And no business markers are shown
    And the hasMore flag is false

  Scenario: Page beyond the last page returns no offers
    Given the user is on Offers view
    And a search matching a known number of offers has been executed
    When the user requests a page beyond the last available page
    Then no offers are shown in the list
    And the hasMore flag is false
    And markers still reflect the full filtered result set
