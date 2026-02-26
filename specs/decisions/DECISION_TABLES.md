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
| Detection timing | Real-time while typing | Word candidates update continuously |
| Selection interaction | Single tap on detected word | No long-press delay |
| Selection granularity | Whole word only | Partial substring is invalid |
| Normalization | Lowercase and trim punctuation except `%` | Prevent duplicates like `Coffee` vs `coffee` while preserving `50%` |
| Percent handling | Preserve trailing percent symbol | `50%` remains `50%` |
| Duplicate tags | Prevent duplicates | Existing tag remains highlighted or unchanged |
| Manual tags | Allowed | Same normalization and duplicate rules apply |

## Location Selection Rules (`ADD.OFFER.LOCATION.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Auto-population trigger | Add Offer view open | Use current GPS location when available |
| Permission denied | Keep location empty and surface error state | User can still use location suggestions by text |
| Confirm action | Persists selected location in draft | No publish action implied |
| Edit action | Returns location to editable mode | Re-enables confirm flow |
| Search interaction | Typeahead suggestions from 3rd character | No dedicated Search button |
| Search selection | Replaces current selected location | Latest user-selected result wins |
| Textbox after selection | Set to selected suggestion label | Keeps chosen place visible to user |
| Mini map behavior | Show selected location red marker | Updates when selected result changes |
| Initial button state | Confirm enabled, Edit disabled | Before location confirmation |
| After confirm | Confirm disabled, Edit enabled | Location is locked |
| After edit | Edit disabled, Confirm enabled | Location can be changed again |

## Map Provider Module Rules (`APP.CONFIG.MAPS.001`, `OFFERS.MAP.001`, `ADD.OFFER.LOCATION.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Provider configuration source | Internal app configuration | Not hardcoded in feature behavior |
| Supported providers | Google Maps API and OpenLayers API | Additional providers may be added later |
| Offers map renderer | Use configured provider | Applies to map display and markers |
| Add Offer location search | Use configured provider | Applies to business/address text lookup |
| Provider initialization failure | Apply configured fallback behavior | App remains available |
| Provider switch lifecycle | Effective after config reload/app restart policy | Controlled by app configuration policy |

## Offer Availability Feedback Rules (`OFFERS.LIST.ACTIONS.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Feedback label | `Available?` | Displayed with thumbs controls |
| Upvote control | Thumbs up icon | Increments positive counter by 1 |
| Downvote control | Thumbs down icon | Increments negative counter by 1 |
| Vote uniqueness | One vote per user per offer | User cannot vote again on the same offer |
| Button state after vote | Both thumbs buttons disabled | Buttons remain visible but cannot be used again by same user |
| Button state before vote | Both thumbs buttons enabled | Vote action is available when user has not voted |
| Counter default | `0` | Used when no prior feedback exists |
| Counter display | Positive as integer, negative as integer count | Example `12` up and `3` down |

## Report Prefill Rules (`OFFERS.LIST.ACTIONS.001`, `REPORTS.OFFER.PREFILL.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Report button in offer item | Navigate to Reports view | Does not submit immediately from Offers view |
| Prefilled offer context | Include selected offer preview | Business, image, description, tags |
| Prefilled metadata | `userId`, `offerId`, report date/time, text | Captured at report-button press time |
| Direct Reports access | No preview required | User can still submit generic report |
| Report payload from offer flow | Include message + metadata | Includes `userId`, `offerId`, and report date/time |

## Account Session and Entry Rules (`APP.SHELL.001`, `ACCOUNT.AUTH.*`, `ACCOUNT.PROFILE.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Startup first view (no session) | `Login` | Unauthenticated user starts in Login view |
| Startup first view (with session) | `Offers` | Active authenticated session skips Login |
| Login success navigation | Redirect to `Offers` | Session established before redirect |
| Create user success navigation | Redirect to `Offers` | User is automatically authenticated |
| Login view secondary action | Link to `Create User` | Allows account creation from auth entry point |
| Create user email validation | Required valid email format | Reject malformed emails |
| Create user password validation | Strong password required | Minimum 8 chars, letters and numbers |
| Session persistence | Persist on device | User remains logged in across app restarts |
| My Account unauthenticated access | Redirect to `Login` | Profile requires active session |
| Logout behavior | Clear session and redirect to `Login` | Applies from My Account context |
