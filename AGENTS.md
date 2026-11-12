# DealsSeeker Agent Instructions

## Project Overview
DealsSeeker is a .NET 10 app:
- `DealsSeeker.Mobile`: .NET MAUI Blazor Hybrid mobile app.
- `DealsSeeker.Api`: ASP.NET Core 10 Minimal API.
- `DealsSeeker.Shared`: shared contracts/models.

Persistence: Dapper + SQLite. Logging: Serilog. Maps: configurable providers (GoogleMaps/OpenLayers).

## Specs Repository (`specs/`)
Implementation-agnostic, AI-friendly behavioral specs.

### Structure
- `features/<view-slug>/` — atomic behavioral specs, one behavior per file.
- `contracts/json-schema/` — machine-readable data contracts.
- `examples/` — input/output fixtures.
- `bdd/` — Gherkin feature files.
- `templates/` — authoring templates.
- `glossary.md` — shared domain terms.
- `decisions/` — decision tables for ambiguous behavior.
- `traceability/TRACEABILITY.md` — spec ID and mapping rules.

### ID Convention
- Pattern: `<VIEW>.<AREA>.<NNN>` (e.g. `APP.SHELL.001`, `OFFERS.SEARCH.001`).
- 3-digit, zero-padded number.

### Authoring Rules
1. One spec file per atomic behavior.
2. Use stable IDs.
3. Use `shall` for normative requirements.
4. Include positive and edge scenarios.
5. Add data contracts only when data shape is relevant.
6. Do not describe implementation details (frameworks, storage engines, classes).
7. Coordinate privacy: Add Offer and Offers views must not expose raw `lat`/`lng`.

### Spec File Format (from `specs/templates/FEATURE_SPEC_TEMPLATE.md`)
```
# Spec: `<SPEC_ID>`

## Metadata
- **Title**:
- **Version**: `v1.0`
- **Status**: Draft | Approved
- **Context/View**:
- **Priority**: High | Medium | Low

## Purpose
One-line intent.

## Preconditions
- ...

## Trigger
- ...

## Requirements
- `<SPEC_ID>-R1`: The system shall ...

## Acceptance Criteria (BDD)
```gherkin
Scenario: ...
  Given ...
  When ...
  Then ...
```

## Example Inputs/Outputs
- Example input:
- Expected output:

## Edge Cases
- ...

## Non-Functional Constraints
- ...

## Related Specs
- `RELATED.SPEC.001`
```

### Traceability (when adding a spec)
- Add a row in `specs/traceability/TRACEABILITY.md`: Spec ID → feature file → contract → examples.
- Add bidirectional `Related Specs` entries in dependent specs.
- Add BDD scenario in `specs/bdd/` if needed.
- Add contract in `specs/contracts/json-schema/` and fixtures in `specs/examples/` when data shape is relevant.

### Bounded Contexts (Views)
Application Shell, My Account (auth login/register/profile), Offers (search, smart search, promoted feed, grid cards, image rendering, favorites, reported demotion, detail actions, photos carousel, map, list item/actions, layout, nav-to-add), Add Offer (layout, image, location, description/tags, tag suggestions), Suggestions (submit), Reports (submit, offer prefill).

### Key Cross-Cutting Concerns
Theme, localization, logging, map provider config, navigation mode (pedestrian/car), coordinate privacy, session persistence, smart search (exact + fuzzy + synonyms), promoted/reported offers, photo carousel.

## Implementation Scope
- All changes SHALL target only the API (`DealsSeeker.Api`) and React Native (`DealsSeeker.ReactNative`) projects.
- The .NET MAUI mobile project (`DealsSeeker.Mobile`) SHALL NOT be implemented/modified unless the user explicitly asks for it.
- If a request implies mobile work, confirm with the user before touching `DealsSeeker.Mobile`.

## Change Workflow (Spec-First)
- Any change (feature, bug fix, refactor affecting behavior) SHALL be preceded by a spec change.
- Order of work:
  1. Update or add the relevant spec(s) in `specs/` (and traceability/examples/contracts/BDD as needed).
  2. Only after the spec change is in place, implement the code change.
- No code change is valid without a corresponding spec change having been made first.
- If a change is purely non-behavioral (formatting, comments, internal rename with no observable effect), it is exempt, but must be justified as such.

## BDD Flow
- Every change SHALL follow this BDD-driven flow before any code is touched:
  1. **Create or update specs**: Add or modify the relevant spec file(s) in `specs/features/<view-slug>/` and the matching Gherkin scenario(s) in `specs/bdd/` (one behavior per file; stable IDs; `shall` requirements; positive + edge scenarios).
  2. **Validate**: Verify the spec/BDD change is complete and consistent:
     - Spec ID follows `<VIEW>.<AREA>.<NNN>` and is registered in `specs/traceability/TRACEABILITY.md`.
     - Every spec ID has at least one BDD scenario; contracts/examples reference the spec ID.
     - Related specs are linked bidirectionally; contracts and fixtures added when data shape is relevant.
     - No implementation details (frameworks, storage engines, classes); coordinate privacy respected (no raw `lat`/`lng` in Add Offer / Offers views).
     - Positive and edge scenarios present.
  3. **Approve**: Set the spec `Status` metadata from `Draft` to `Approved` (and keep BDD scenarios aligned) only after validation passes. No implementation may start while status is `Draft`.
  4. **Implement**: Only after approval, implement the code change in the API / React Native projects per Implementation Scope.
- A change is not complete until its spec is `Approved` and its BDD scenarios reflect the implemented behavior. If behavior changes during implementation, update the spec/BDD and re-validate/re-approve before merging.

## Conventions
- Implementation-agnostic specs; no framework/storage/class details.
- `shall` for normative requirements.
- Positive + edge scenarios required.