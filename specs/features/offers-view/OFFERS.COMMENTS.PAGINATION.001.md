# Spec: `OFFERS.COMMENTS.PAGINATION.001`

## Metadata
- **Title**: Offer Comments Paging
- **Version**: `v1.0`
- **Status**: Approved
- **Context/View**: Offers View (immersive feed and offer detail view)
- **Priority**: Medium

## Purpose
Define how offer comments are loaded in pages, how the next page is requested, and how the end of the comments list is signalled.

## Preconditions
- User is authenticated.
- An offer is being viewed.
- The offer has at least one published comment or the comments list is empty.

## Trigger
- User opens the comments section for an offer or requests the next page of comments.

## Requirements
- `OFFERS.COMMENTS.PAGINATION.001-R1`: The comments list request shall accept an optional `limit` value that shall default to `20` when it is not supplied.
- `OFFERS.COMMENTS.PAGINATION.001-R2`: The effective `limit` shall not exceed `100` comments.
- `OFFERS.COMMENTS.PAGINATION.001-R3`: The comments list request shall accept an optional `after` cursor that identifies a position in the comments ordering.
- `OFFERS.COMMENTS.PAGINATION.001-R4`: The `after` cursor shall be an opaque value produced by the system and returned to the client, and the client shall not interpret its content.
- `OFFERS.COMMENTS.PAGINATION.001-R5`: The comments response shall carry the `comments` array for the requested page.
- `OFFERS.COMMENTS.PAGINATION.001-R6`: The comments response shall carry a `hasMore` flag that indicates whether further comments exist for the offer.
- `OFFERS.COMMENTS.PAGINATION.001-R7`: The comments response shall carry a `nextCursor` value that identifies the position of the following page.
- `OFFERS.COMMENTS.PAGINATION.001-R8`: The `nextCursor` value shall be absent or null when there are no further comments.
- `OFFERS.COMMENTS.PAGINATION.001-R9`: Comments shall remain ordered from oldest to newest across pages, and the same comment shall never be returned on more than one page.
- `OFFERS.COMMENTS.PAGINATION.001-R10`: A request for more comments than exist shall return the remaining comments, `hasMore` set to `false`, and no `nextCursor` value.
- `OFFERS.COMMENTS.PAGINATION.001-R11`: The system shall reject a request whose `limit` is lower than `1` or greater than `100` with a validation error response.
- `OFFERS.COMMENTS.PAGINATION.001-R12`: The system shall reject a request carrying an `after` cursor that the system does not recognise with a validation error response.

## Acceptance Criteria (BDD)
```gherkin
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

Scenario: Limit below the minimum is rejected
  Given an authenticated user opens the comments section for an offer
  When the comments list is requested with a limit of 0
  Then the request shall be rejected with a validation error

Scenario: Unrecognised cursor is rejected
  Given an authenticated user opens the comments section for an offer
  When the comments list is requested with an unrecognised after cursor
  Then the request shall be rejected with a validation error

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

Scenario: Comments section exposes the paging affordance
  Given an authenticated user opened the comments section for an offer
  And the offer has more comments than fit in a single page
  When the comments list is displayed
  Then the user shall be able to request the next page of comments
```

## Example Inputs/Outputs
- Example input: request the comments list for offer `off-100` with `limit` `2` and the cursor returned by the previous page.
- Expected output: a response with two comments, `hasMore` `true`, and a `nextCursor` value identifying the next position.

## Edge Cases
- An offer with no comments yields an empty `comments` array, `hasMore` `false`, and no `nextCursor` value.
- An offer whose comment count is an exact multiple of the page size reports `hasMore` `false` on the last page.
- A comment published while paging may appear in a later page, and shall never appear twice.
- Invalid `limit` or `after` cursor values shall be rejected before the comment list is produced.

## Non-Functional Constraints
- Comments shall load without exposing raw coordinates.
- The paging affordance shall remain usable on narrow viewports.

## Related Specs
- `OFFERS.COMMENTS.001`
- `ACCOUNT.PROFILE.AVATAR.001`
