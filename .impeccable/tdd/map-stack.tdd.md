# TDD evidence — single map and geocoding stack

Specs: `APP.MAP.STACK.001`, `APP.LOCATION.QUERY.001` (approved in `e920d95`).

## Journeys
- As a deal hunter, I want one native Google Maps surface everywhere and Photon-backed address lookup, so the app stays consistent and respects Photon fair use.
- As a contributor, I want address search to settle before it runs and repeat lookups reused, so typing is quiet and fast.
- As a contributor, I want reverse geocoding only when a gesture finishes, so dragging the map does not flood Photon.

## RED → GREEN

| Cycle | RED evidence | GREEN evidence |
|---|---|---|
| API | `3af5b17` — `dotnet test ... --filter PhotonLocationLookupServiceTests` failed to compile: `PhotonLocationLookupService` did not exist. | `8445121` — `dotnet test DealsSeeker.sln`: 290 passed, 0 failed. Single Photon adapter with bounded caching; Google geocoder/provider port removed. |
| RN | `60a5886` — 5 targeted suites failed: provider switches present, WebView map still loaded, no drag-end callback, no client cache. | `c12311c` — `npm test`: 63 suites / 374 tests; `npm run typecheck`, `npm run test:arch` clean. WebView map removed, directions Google-only, bounded client cache, drag-end handler. |
| Spec compliance follow-up | No failing test for a missing native map. | Added `NativeMapPreview` unavailable guard + `nativeMapUnavailable.test.tsx`; 2 targeted suites / 7 tests pass, typecheck clean. |

## Guarantees
| # | Guarantee | Test | Result |
|---|---|---|---|
| 1 | Search/reverse use Photon endpoints only | `PhotonLocationLookupServiceTests` | PASS |
| 2 | Identical lookups reuse a bounded cache | `PhotonLocationLookupServiceTests`, `client.test.ts` | PASS |
| 3 | Provider failure is distinguishable from no results | `PhotonLocationLookupServiceTests`, `LocationIntegrationTests` | PASS |
| 4 | No alternate map renderer or provider switch exists | `config.test.ts`, `maps.test.ts`, `nativeMapPreview.test.tsx`, `adaptiveBehavior.test.tsx` | PASS |
| 5 | Reverse geocoding fires on tap/region completion, not continuously | `nativeMapPreview.test.tsx`, `nativeMapUnavailable.test.tsx` | PASS |
| 6 | Missing native map reports failure without a fallback surface | `nativeMapUnavailable.test.tsx` | PASS |
| 7 | SSRF-safe Photon URL construction | `OwaspSsrfTests` | PASS |

## Device verification (emulator-5554)
- Login succeeded; Add Offer opened with a single reverse request for the GPS position (`16:04:58`).
- Typing `c`,`o`,`f`,`f`,`e`,`e` rapidly produced exactly one `GET /api/locations/search?query=coffee` (`16:08:38`) to `https://photon.komoot.io/api`.
- Repeating `coffee` produced no second API request — client cache hit.
- Tapping the map produced one reverse request (`16:10:52`) and updated the address label.
- Accessibility hierarchy reports a native `Google Map` view; no WebView renderer is present.
- Drag-end could not be exercised on device because Google tiles do not render in this emulator; the callback is covered by `nativeMapPreview.test.tsx`.

## Known gaps
- Maestro E2E remains blocked by `Maestro Android driver did not start up in time`.
- No iOS visual verification (macOS/Xcode unavailable).
