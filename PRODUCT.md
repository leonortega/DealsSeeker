# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

Mobile-only: iOS and Android are the shipped targets, built from one Expo/React Native codebase with one brand-defined design language. OS-level behavior adapts per platform (Back, gestures, insets, modal semantics, lifecycle); the application UI/UX stays identical on both. (`adaptive` is the recorded value because the product spans multiple native mobile platforms.)

## Users

Primary users are local deal hunters and community contributors, in equal measure. The same audience performs both jobs:

- Deal hunters discover discounted offers near their current location through the map, coverage radius, and tag search.
- Contributors post offers and keep them accurate through availability votes, reports, and comments.

*(Confirmed in the init interview.)*

## Product Purpose

DealsSeeker helps people find relevant local deals nearby and maintain a trustworthy, community-contributed set of offers. Success means a user can discover a good offer close to them quickly, and can add or update offers so the corpus stays accurate.

*(Discovery + contribution confirmed as the differentiator; success framing inferred from the behavioral specs.)*

## Positioning

The differentiating value is discovery + contribution together: hyperlocal discovery (map, coverage radius, and smart tag search combining exact, fuzzy, and synonym matching) fused with community-maintained accuracy (availability votes, reports with reported-offer demotion, promoted offers, favorites, and comments). A neighboring product could not truthfully copy both halves as one continuous flow.

*(Confirmed in the interview; specifics drawn from `specs/glossary.md` and the feature specs.)*

## Operating Context

- Mobile client (Android and iOS) backed by a single ASP.NET Core minimal API.
- Device geolocation supplies the user location; in-app maps and external navigation use Google Maps, while address search and reverse geocoding use Photon through the API.
- Offers are browsed as a vertical full-screen feed, a map, or a grid/list; the immersive feed overlays business name, distance, description, and tags.
- Account flows: register/login, sessions persisted across app launches, profile with avatar and owned offers.
- Contribution flows: Add Offer (image capture/upload, auto + searched location, description + tags, tag suggestions), Suggestions submit, and Reports submit with offer prefill.
- Localization resources externalize UI strings; a theme applies across views.

*(Inferred from repository evidence: `README.md`, `ARCHITECTURE.md`, and `specs/glossary.md`.)*

## Capabilities and Constraints

- Spec-first workflow is mandatory: any behavior change must be preceded by an Approved spec change in `specs/`; no code change without a corresponding spec change.
- Coordinate privacy: Add Offer and Offers views must not expose raw `lat`/`lng` to users; coordinates are internal to mapping, navigation, and persistence.
- The map stack is fixed: native Google Maps for display and directions, Photon for geocoding. Location searches are debounced and cached, and reverse geocoding runs only on tap or drag completion.
- Cross-cutting concerns future work must preserve: theme, localization, logging, Google Maps credential configuration, navigation mode (pedestrian/car), coordinate privacy, session persistence, smart search, promoted/reported offers, and the photo carousel.
- Scale direction (from the Draft `ARCHITECTURE.md` proposal, not yet approved product truth): bounded per-request cost, no blocking I/O on the request path, graceful degradation of external providers, defensiveness under abuse (rate limits, payload caps, 429 with `Retry-After`), observability, and a documented SQLite-to-PostgreSQL path.

*(Inferred from repository evidence: `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, and the specs.)*

## Brand Commitments

- Product name: **DealsSeeker**.
- Specified branded behaviors that must be preserved: a branded splash screen (~2 seconds) on startup, and the application name and logo in the immersive feed.
- All views share one font family, color palette, and surface treatment, including the immersive feed.

*(Drawn from the behavioral specs, e.g. `APP.SHELL.001` and `OFFERS.FEED.IMMERSIVE.001`. No standalone brand assets, logo files, or documented voice guidelines were found in the repository.)*

## Evidence on Hand

- Behavioral specs, BDD scenarios, JSON contracts, examples, and a traceability matrix in `specs/` (`specs/glossary.md`, `specs/traceability/TRACEABILITY.md`, `specs/features/`, `specs/bdd/`, `specs/contracts/json-schema/`, `specs/examples/`).
- `ARCHITECTURE.md` (Draft scaling proposal) and `README.md` (run/configuration docs).
- Automated suites: Jest unit/component tests, Playwright E2E, performance, security, and architecture tests (`test/`, `src/DealsSeeker.ReactNative`).
- Absent — do not fabricate: customer testimonials, case studies, pricing, licensing, or deployment claims.

## Product Principles

- Discover nearby, act locally: relevance is grounded in the user's current location and a bounded radius.
- Contribution is first-class: finding offers and keeping them accurate are equally important jobs.
- Spec before code: observable behavior is defined and Approved before implementation.
- Privacy by default: raw coordinates never surface in Add Offer or Offers views.
- One coherent system across platforms: mobile-native-first, with a shared design language and resilient, configurable integrations.
