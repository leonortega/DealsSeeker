# Design Pattern Review — DealsSeeker single map and geocoding stack

Date: 2026-11-25
Mode: `--design` (specs `APP.MAP.STACK.001`, `APP.LOCATION.QUERY.001` and the revised map/location specs)

## Project Summary
.NET 10 Minimal API + Expo/React Native client. Dapper/SQLite persistence. This review validates the intended design before the code change that removes alternate map renderers, alternate geocoding providers, and redirect provider switching.

## Findings

1. **Strategy/provider abstraction is no longer justified. (High)**
   `ILocationLookupProvider` plus `ConfigurableLocationLookupService` exist only to select between Google Maps and Photon and to fail over between them. With a single Photon provider and the spec forbidding fallback (`APP.LOCATION.PROVIDER.RESILIENCE.001-R6`), the provider port, provider-key normalization, and configurable resolver are speculative abstraction. Recommend one adapter implementing the endpoint-facing `ILocationLookupService`; keep `ICacheService` for the cross-cutting cache. Reconcile the architecture test's adapter/port lists with the new shape.

2. **Cache belongs at the API edge, not inside multiple providers. (Medium)**
   The existing `ICacheService` decorator already applies positive/negative TTLs to both search and reverse. Keep that single caching layer, keyed by normalized query and rounded coordinate. Add a small bounded device-side result cache for identical queries/reverse coordinates; do not add a caching dependency for a few lines of `Map` logic (`ponytail`).

3. **Renderer fallback is removed by spec, so the wrapper becomes a thin adapter. (Medium)**
   `NativeMapPreview` currently wraps a native map and conditionally delegates to a WebView map. With `APP.MAP.STACK.001-R2` forbidding an alternate renderer, the wrapper should render the native view directly and report initialization failure, rather than keep a branch that can never be taken. Keep marker/circle/pin props as the single interface; no new abstraction layer.

4. **Gesture completion maps cleanly to native map callbacks; avoid an event bridge. (Low)**
   Reverse-geocode timing (`APP.LOCATION.QUERY.001-R4/R5`) can use tap and region-change-completion callbacks with the existing monotonic sequence guard. Do not reintroduce a serialized message bridge — `OFFERS.MAP.001-R19` now requires direct delivery.

5. **Redirect helper can collapse to one Google Maps URL builder. (Low)**
   `utils/maps.ts` currently builds Google and OpenStreetMap URL families behind a provider switch. With `APP.MAP.STACK.001-R4`, one Google Maps URL builder with platform-aware launch is sufficient; keep the travel-mode behavior required by `APP.NAVIGATION.MODE.001`.

6. **Specs are internally consistent. (Info)**
   New IDs are registered in traceability, every new spec has BDD scenarios, reciprocal `Related Specs` links were added, coordinate-privacy rules remain intact, and no framework/class names leaked into the feature specs.

## Recommendation
Proceed to TDD implementation with the single-adapter API design (finding 1) and the thin native map adapter (finding 3). No new dependencies. Update the architecture tests' expected port/adapter names in the same change.
