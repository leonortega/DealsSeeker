# Decision Tables

## Search Matching and Ranking Rules (`OFFERS.SEARCH.001`, `OFFERS.SEARCH.SMART.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Match scope | Offer searchable terms plus dictionary expansions | Supports exact query terms, fuzzy dictionary candidates, and synonyms |
| Exact match | Enabled | Query normalized for case-insensitive comparison |
| Fuzzy match | Enabled | Uses configurable similarity ratio threshold (default TBD) |
| Synonym expansion | Enabled | Uses selected-language dictionary with multilingual support |
| Dictionary by language | Use selected app language | Falls back to default language dictionary when missing |
| Dictionary unavailable | Exact match fallback | Search remains available |
| Result merge | Union with de-duplication | Matches from multiple strategies appear once |
| Multiple words | AND semantics | All query tokens must be satisfied by merged strategy hits |
| Empty query | No text matching | Full active offer set is shown before optional promoted/report ordering |
| Radius change with active query | Re-run search automatically | Applies search matching + distance filtering |
| Radius change with empty query | Re-run search automatically | Applies distance-only filtering |
| Radius change map zoom | Adjust map zoom to keep selected radius visible | Applies with and without search text |
| Result sort | Relevance descending, then distance ascending | Relevance score computed from strategy weights and similarity score |
| Reported demotion | Applied after ranking | Reported offers are pushed to bottom |

## Offer List Distance Display Rules (`OFFERS.LIST.ITEM.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Distance value source | Computed from current user location | Uses internal coordinates |
| Distance visibility | Show per offer in meters | User-facing value in offer list item |
| Distance format | Rounded integer meters | Example `235 m` |

## Tag Creation and Suggestion Rules (`ADD.OFFER.DESCRIPTION.TAGS.001`, `ADD.OFFER.TAGS.SUGGESTIONS.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Detection timing | Real-time while typing | Word candidates update continuously |
| Selection interaction | Single tap on detected word | No long-press delay |
| Selection granularity | Whole word only | Partial substring is invalid |
| Normalization | Lowercase and trim punctuation except `%` | Prevent duplicates like `Coffee` vs `coffee` while preserving `50%` |
| Percent handling | Preserve trailing percent symbol | `50%` remains `50%` |
| Duplicate tags | Prevent duplicates | Existing tag remains highlighted or unchanged |
| Manual tags | Allowed | Same normalization and duplicate rules apply |
| Suggestion scope | Similar and semantically related tags | Driven by dictionary similarity and synonyms |
| Suggestion threshold | Configurable | Similarity ratio threshold default is TBD |
| Suggestion presentation | Optional chips/pills | Non-blocking UX |
| Suggestion persistence | Explicit accept only | Removed/unaccepted suggestions are not saved |
| Suggestion language | Use selected app language | Fallback to default language resources |

## Offer Photos and Rendering Rules (`ADD.OFFER.IMAGE.001`, `OFFERS.IMAGE.RENDERING.001`, `OFFERS.PHOTOS.CAROUSEL.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Upload count | Multiple photos allowed | Maximum count configurable (default TBD) |
| Gallery selection | Multi-file selection allowed | Add Offer supports selecting multiple files in one action |
| Photo order | User-defined order | Reordering persists and drives preview/carousel order |
| Primary preview | First ordered photo | Used for grid/summary by default |
| Upload normalization | Resize/crop on processing | Target aspect ratio is uniform |
| Render mode | `square-crop` default | Optional `stretched-fill` mode supported by config |
| Detail display | Swipeable carousel | Supports all stored photos |
| Processing failure | Placeholder fallback | Layout remains stable |

## Favorites Rules (`OFFERS.FAVORITES.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Favorite control | Heart/star toggle per offer card | Visible in grid cards |
| Save semantics | Toggle saved state for current user | Idempotent per offer/user |
| Persistence | Account-backed | Not local-only storage |
| Sync scope | Cross-session and cross-device | Based on authenticated account |
| My Favorites source | Saved offers only | Uses same offer entity data model |

## Promoted Offers Rules (`OFFERS.FEED.PROMOTED.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Display trigger | Initial Offers load before user search | Pre-search feed behavior |
| Placement | Top of feed or dedicated promoted section | Must be visually distinct |
| Labeling | Explicit sponsored/promoted label | Avoid ambiguity |
| Monetization role | Primary feed monetization mechanism | Product policy requirement |
| Retrieval failure | Graceful degradation | Show standard feed without blocking |

## Reported Offer Demotion Rules (`OFFERS.REPORTED.DEMOTION.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Main feed ordering | Reported offers at bottom | Non-reported shown first |
| Search ordering | Reported offers at bottom | Applied after relevance ranking |
| Visual indicator | Red border or red background | Must be visible in both themes |
| Missing report state | Conservative demotion when uncertain | Safer default for moderation flow |

## Theme Rules (`APP.THEME.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Initial theme source | Device/OS preference | Light or dark |
| Manual override precedence | Override wins over OS theme | Until user resets to system |
| Quick theme control location | Main navigation menu | Also configurable from settings |
| Theme apply timing from menu | Immediate runtime apply | No app restart required |
| Reset behavior | Return to system-follow mode | Uses current OS preference |
| Theme coverage | Both themes fully implemented | Applies across all app views |

## Localization Rules (`APP.LOCALIZATION.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Default language value | Device/system locale | Applied at startup when no override |
| Manual language override | Available in app settings | Persists for user account |
| Quick language control location | Main navigation menu | Also configurable from settings |
| Language apply timing from menu | Immediate runtime apply | UI text and language dictionaries refresh in current view |
| UI string source | Externalized resource files | No hardcoded UI text |
| Search dictionaries | Load by selected language | Used by smart search and tag suggestions |
| Missing translation key | Fallback to default language | Prevents blank UI text |
| Missing language dictionary | Feature-level fallback | Non-blocking exact match/manual tag flow remains available |

## Startup Splash and Blocking Loading Rules (`APP.SHELL.001`, `OFFERS.SEARCH.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Splash display trigger | App startup | Runs before first interactive view |
| Splash duration | About 2 seconds | Target duration, not hard real-time |
| Splash behavior | Branded animated intro with smooth exit | Keeps startup identity consistent |
| Global loading trigger | Any required in-view data request in progress | Includes initial location fetch and search |
| Loading UI | Blocking overlay with animated indicator | Prevents accidental double actions |
| Interaction during loading | Disabled for underlying view | Overlay blocks taps/clicks/inputs |
| Concurrent requests | Reference-counted busy state | Overlay hides only when all required requests complete |
| Request failure | Hide overlay and show normal error/empty UI state | Failure must not leave UI blocked |

## Location Selection Rules (`ADD.OFFER.LOCATION.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Auto-population trigger | Add Offer view open | Use current GPS location when available |
| Auto-population display value | Nearest resolved address label | Derived from reverse-geocoding GPS coordinates |
| Permission denied | Keep location empty and surface error state | User can still use location suggestions by text |
| Confirm action | Persists selected location in draft | No publish action implied |
| Edit action | Returns location to editable mode | Re-enables confirm flow |
| Search interaction | Typeahead suggestions from 3rd character | No dedicated Search button |
| Search selection | Replaces current selected location | Latest user-selected result wins |
| Textbox after selection | Set to selected suggestion label | Keeps chosen place visible to user |
| Coordinate visibility in UI | Hidden | Raw `lat`/`lng` never shown to end users in Add Offer location text |
| Coordinate persistence | Persist `lat`/`lng` in draft and DB | Internal data only, used for map and backend storage |
| Reverse-geocode fallback | Show generic non-coordinate label | Do not expose numeric coordinates when address not resolved |
| Mini map behavior | Show selected location red marker | Updates when selected result changes |
| Initial button state | Confirm enabled, Edit disabled | Before location confirmation |
| After confirm | Confirm disabled, Edit enabled | Location is locked |
| After edit | Edit disabled, Confirm enabled | Location can be changed again |

## Map Provider Module Rules (`APP.CONFIG.MAPS.001`, `OFFERS.MAP.001`, `ADD.OFFER.LOCATION.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Provider configuration source | Internal app configuration | Not hardcoded in feature behavior |
| Supported providers | Google Maps API and OpenLayers API | Additional providers may be added later |
| In-view map renderer provider | Configured independently | Applies to Offers/Add Offer rendered maps |
| Navigation redirect provider | Configured independently | Applies when user opens directions from offers/markers/detail button |
| Offers map renderer | Use configured in-view renderer provider | Applies to map display and markers |
| Add Offer location search | Use configured in-view renderer provider | Applies to business/address text lookup |
| Offer click redirect | Use configured navigation redirect provider | May differ from in-view renderer |
| Provider initialization failure | Apply configured fallback behavior | App remains available |
| Provider switch lifecycle | Effective after config reload/app restart policy | Controlled by app configuration policy |

## Offers Location Display Rules (`OFFERS.MAP.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Offers location text value | Human-readable address label | Applies to user-facing location text in Offers view |
| Coordinate visibility in Offers UI | Hidden | Raw `lat`/`lng` not displayed to end users |
| Coordinate usage | Internal only | Coordinates still drive map markers, filtering, directions, and persistence |
| Address-label fallback | Generic non-coordinate label | Avoid exposing numeric coordinates when no address is resolved |

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

## Account Session and Post-Submit Navigation Rules (`APP.SHELL.001`, `ACCOUNT.AUTH.*`, `ACCOUNT.PROFILE.001`, `ADD.OFFER.LAYOUT.001`, `REPORTS.OFFER.PREFILL.001`)

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
| Startup with expired persisted session | Clear session and redirect to `Login` | Prevent access with invalid token |
| My Account unauthenticated access | Redirect to `Login` | Profile requires active session |
| Logout behavior | Clear session and redirect to `Login` | Applies from My Account context |
| Suggestions submit success | Redirect to `Offers` | Applies only when response has no errors |
| Reports submit success | Redirect to `Offers` | Applies only when response has no errors |
| Add Offer submit success | Redirect to `Offers` | Applies only when offer create response has no errors |
| Any submit error | Stay in current view and show error/status | No redirect on failed response |

## Logging Rules (`APP.LOGGING.001`)

| Decision Point | Default Rule | Notes |
|---|---|---|
| Logging framework | Serilog | Preferred logging pipeline |
| Global minimum level | Configurable via internal configuration | Example: `Information`, `Warning`, `Error` |
| File sink | Enabled and persistent | Rolling log files |
| Database sink | Enabled and persistent | Writes to `logs` table |
| Database sink minimum level | Separately configurable | Can be stricter than global minimum |
| Invalid configured level | Fallback to `Information` | Avoid startup failure |
| Sink failure handling | Other sinks continue when possible | API should remain available |
