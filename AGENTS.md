# DealsSeeker Agent Instructions

## Project Overview
DealsSeeker is a .NET 10 app:
- `DealsSeeker.ReactNative`: Expo/React Native mobile client (iOS and Android).
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
- Changes SHALL target the API (`DealsSeeker.Api`) and React Native (`DealsSeeker.ReactNative`) projects.
- The React Native project is the mobile-only client (iOS and Android); all client work targets `DealsSeeker.ReactNative`.

## Skills (Agent Playbook)
The installed skills listed below are part of the DealsSeeker workflow. Load the
relevant skill(s) at the point indicated — they define *how* work is done; the
specs and this file define *what* is done.

| When / trigger | Skill | Applied to DealsSeeker |
|---|---|---|
| Reviewing `ARCHITECTURE.md`, a design doc, or the specs before/around a change | `design-pattern-review` | `--design` to validate the intended design; `--code --scope DealsSeeker.Api` / `--scope DealsSeeker.ReactNative` to find pattern opportunities. Reconcile findings with specs before coding. |
| Writing any production code (API + React Native) | `solid` | Default quality bar: SOLID, professional design, TDD, clean code. |
| Writing new code, reviewing a PR, or cleaning legacy code | `clean-code` | Meaningful names, small single-purpose functions, no needless comments, remove smells. |
| New feature, bug fix, endpoint, component, or refactor | `tdd-workflow` | RED → GREEN → REFACTOR; target 80%+ coverage across unit / integration / E2E; BDD scenarios are the test source of truth. |
| Every implementation task (standing guardrail) | `ponytail` | Laziest solution that works: YAGNI; reuse existing helpers; stdlib/native first; no new dependency for a few lines. Stop at the first rung that holds. |
| Behavior-preserving refactor (allowed by the spec-first rule) | `safe-refactor` | Keep feature work out; move one ownership boundary at a time; preserve public interfaces, failure behavior and ordering; keep intermediate states buildable and re-run the same proof. |
| Before merging (diff review) | `ponytail-review` | One-line findings on the diff: delete/simplify over-engineering; complements correctness review. |
| Periodic / repo-wide complexity cleanup | `ponytail-audit` | One-shot ranked report of what to delete, simplify, or replace; applies nothing. |
| Manual verification of API behavior | `browser` | Open the endpoint, exercise the BDD scenario, check console + network logs where relevant. Hand off for login/2FA/captcha/payment. |

Not part of this project's workflow: `opencode` (questions about OpenCode itself)
and `report` (filing OpenCode issues) — they concern the harness, not DealsSeeker.

### Precedence when skills overlap
1. This file + the approved specs/BDD — authoritative on *what* and on behavior; win over any skill.
2. `tdd-workflow` / `solid` — the proof (tests first) and the quality bar for code that exists.
3. `clean-code` — readability and smell removal within that code.
4. `ponytail` — limits *how much* code, abstraction, and dependency is added; it does not lower the test/quality bar. Reuse beats reimplementation; minimal beats speculative.
5. `design-pattern-review` / `safe-refactor` — advisory on structure; reconcile with specs before applying.
6. `ponytail-review` / `ponytail-audit` — advisory complexity reports; never override a spec requirement.

If `ponytail` and `solid`/`clean-code` pull in opposite directions, keep the
smallest design that is still testable and satisfies the spec; do not add
abstractions for hypothetical future needs.

## Change Workflow (Spec-First)
- Any change (feature, bug fix, refactor affecting behavior) SHALL be preceded by a spec change.
- Order of work:
  1. Update or add the relevant spec(s) in `specs/` (and traceability/examples/contracts/BDD as needed).
  2. Validate design choices against the architecture using `design-pattern-review` when structure is affected.
  3. Only after the spec change is in place, implement the code change (see Skills for implementation, refactor and review skills).
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
  4. **Implement**: Only after approval, implement the code change in the API / React Native projects per Implementation Scope. Follow `tdd-workflow` (tests first, 80%+ coverage), `solid` + `clean-code` for quality, and `ponytail` for the minimal solution. Keep any behavior-preserving refactor under `safe-refactor`.
  5. **Review & verify**: Run `ponytail-review` on the diff (and `ponytail-audit` for periodic repo-wide cleanup). Verify the BDD scenarios on device with `test:e2e` (Maestro) and the API where applicable, and reconcile any structural findings with `design-pattern-review` before merging.
- A change is not complete until its spec is `Approved`, its BDD scenarios reflect the implemented behavior, and the skill-driven review/verification above passes. If behavior changes during implementation, update the spec/BDD and re-validate/re-approve before merging.

## Conventions
- Implementation-agnostic specs; no framework/storage/class details.
- `shall` for normative requirements.
- Positive + edge scenarios required.