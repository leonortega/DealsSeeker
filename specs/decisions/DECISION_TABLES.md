# Decision Tables

## Search Matching Rules (`OFFERS.SEARCH.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Match scope | Tag values only | Description text is out of scope for v1.0 |
| Case handling | Case-insensitive | Normalize both query and tags to lowercase for comparison |
| Partial match | Prefix and substring allowed | `cof` matches `coffee` |
| Empty query | No filtering | Full active offer set is shown |
| Multiple words | AND semantics | All words must match at least one tag |
| Result sort | Distance ascending | If distance unavailable, keep stable input order |

## Tag Creation Rules (`ADD.OFFER.DESCRIPTION.TAGS.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Long-press threshold | 2 seconds minimum | Less than 2 seconds does not create tag |
| Selection granularity | Whole word only | Partial substring is invalid |
| Normalization | Lowercase and trim punctuation | Prevent duplicates like `Coffee` vs `coffee` |
| Duplicate tags | Prevent duplicates | Existing tag remains highlighted or unchanged |
| Manual tags | Allowed | Same normalization and duplicate rules apply |

## Location Selection Rules (`ADD.OFFER.LOCATION.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Auto-population trigger | First image successfully selected | Camera or gallery |
| Permission denied | Keep location empty and surface error state | User can still use Search Location |
| Confirm action | Persists selected location in draft | No publish action implied |
| Search selection | Replaces current selected location | Latest user-selected result wins |

