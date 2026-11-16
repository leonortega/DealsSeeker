# Spec: `OFFERS.SEARCH.PAGINATION.001`

## Metadata
- **Title**: Offers Search Result Paging
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View
- **Priority**: High

## Purpose
Define how offer search results are divided into pages, how page navigation is requested, and how map markers relate to paged list results.

## Preconditions
- User is in Offers view.
- Offer dataset includes searchable metadata and business markers.

## Trigger
- User executes a search, changes the coverage radius, or requests a specific page of results.

## Requirements
- `OFFERS.SEARCH.PAGINATION.001-R1`: The search request shall accept a `page` value that is 1-based and shall default to `1` when it is not supplied.
- `OFFERS.SEARCH.PAGINATION.001-R2`: The search request shall accept a `pageSize` value that shall default to `20` when it is not supplied.
- `OFFERS.SEARCH.PAGINATION.001-R3`: The effective `pageSize` shall not exceed `50` offers.
- `OFFERS.SEARCH.PAGINATION.001-R4`: The search response shall carry the effective `page` value and the effective `pageSize` value used for the returned results.
- `OFFERS.SEARCH.PAGINATION.001-R5`: The search response shall carry a `hasMore` flag that indicates whether further pages exist for the same query and radius.
- `OFFERS.SEARCH.PAGINATION.001-R6`: The `offers` array of the search response shall contain only the offers belonging to the requested page.
- `OFFERS.SEARCH.PAGINATION.001-R7`: The `businesses` array of the search response shall contain map markers for every offer matching the active query and radius, regardless of the requested page.
- `OFFERS.SEARCH.PAGINATION.001-R8`: The ordering of offers within a page and across successive pages shall be stable and deterministic for the same query, radius, and paging values, so that no offer is duplicated or dropped at a page boundary.
- `OFFERS.SEARCH.PAGINATION.001-R9`: A search whose filtered result set is empty shall return an empty `offers` array, an empty `businesses` array, and `hasMore` set to `false`.
- `OFFERS.SEARCH.PAGINATION.001-R10`: A request for a page beyond the last available page shall return an empty `offers` array and `hasMore` set to `false`, while the `businesses` array shall still reflect the full filtered result set.
- `OFFERS.SEARCH.PAGINATION.001-R11`: The system shall reject a request whose `page` is lower than `1`, or whose `pageSize` is lower than `1` or greater than `50`, with a validation error response, before any search work is performed.
- `OFFERS.SEARCH.PAGINATION.001-R12`: The paging behavior shall follow `OFFERS.SEARCH.001` for search matching, ranking, and coverage radius rules.

## Acceptance Criteria (BDD)
```gherkin
Scenario: Search results are paged using default values
  Given the user is on Offers view
  And more active offers match the current query than fit in a single page
  When the user executes the search without paging values
  Then the response shall carry page 1
  And the response shall carry page size 20
  And the offers array shall contain at most 20 offers
  And the hasMore flag shall be true when further matching offers exist

Scenario: Maximum page size is accepted
  Given the user is on Offers view
  When the user requests a search with page size 50
  Then the request shall be accepted
  And the response shall carry page size 50
  And the offers array shall contain at most 50 offers

Scenario: Page size above the maximum is rejected
  Given the user is on Offers view
  When the user requests a search with page size 51
  Then the request shall be rejected with a validation error
  And no search shall be performed

Scenario: Page number below the minimum is rejected
  Given the user is on Offers view
  When the user requests a search with page 0
  Then the request shall be rejected with a validation error
  And no search shall be performed

Scenario: Page size below the minimum is rejected
  Given the user is on Offers view
  When the user requests a search with page size 0
  Then the request shall be rejected with a validation error
  And no search shall be performed

Scenario: Ordering is stable across page boundaries
  Given the user is on Offers view
  And a search matching more offers than fit in one page has been executed
  When the user requests page 1 and then page 2 for the same query and radius
  Then no offer shall appear on both pages
  And no matching offer shall be missing from the requested pages
  And the relative order of the offers shall be the same as in the unpaged result

Scenario: Map markers are not affected by paging
  Given the user is on Offers view
  And a search matching offers across several businesses has been executed
  When the user requests page 2 for the same query and radius
  Then the businesses array shall contain markers for every business with a matching offer
  And the businesses array shall be identical to the businesses array of page 1

Scenario: Empty result set returns empty page and markers
  Given the user is on Offers view
  And no active offer matches the current query and radius
  When the user executes the search
  Then the offers array shall be empty
  And the businesses array shall be empty
  And the hasMore flag shall be false

Scenario: Page beyond the last page returns no offers
  Given the user is on Offers view
  And a search matching a known number of offers has been executed
  When the user requests a page beyond the last available page
  Then the offers array shall be empty
  And the hasMore flag shall be false
  And the businesses array shall still reflect the full filtered result set
```

## Example Inputs/Outputs
- Example input: search for `coffee` with `page` `1` and `pageSize` `2` over a result set of 5 matching offers.
- Expected output: a response with `page` `1`, `pageSize` `2`, `hasMore` `true`, the first 2 matching offers, and markers for all businesses holding matching offers.

## Edge Cases
- A result set whose size is an exact multiple of the page size shall report `hasMore` `false` on the last page.
- A result set smaller than the page size shall return every offer and `hasMore` `false`.
- An invalid paging value shall be rejected before any matching, ranking, or distance filtering is performed.
- Requesting a page beyond the last page shall not clear or reduce the marker set.
- Paging shall not alter the ranking rules defined in `OFFERS.SEARCH.001` and `OFFERS.SEARCH.SMART.001`.

## Non-Functional Constraints
- Paged search shall keep the same responsiveness characteristics as an unpaged search.
- Paging shall not change the coordinate exposure rules defined in `OFFERS.FEED.IMMERSIVE.001`.

## Related Specs
- `OFFERS.SEARCH.001`
- `OFFERS.SEARCH.SMART.001`
- `OFFERS.MAP.001`
- `OFFERS.LIST.ITEM.001`
