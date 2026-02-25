# DealsSeeker Spec Repository

This repository is implementation-agnostic and AI-friendly.

## Goals
- Keep requirements grouped by bounded UI context (view/screen).
- Keep requirements atomic (one main behavior per spec file).
- Make every requirement testable with explicit acceptance criteria.
- Keep traceability across specs, contracts, fixtures, and BDD scenarios.

## Structure
- `features/`: Human-readable behavioral specs by view.
- `contracts/`: Machine-readable contracts (JSON Schema).
- `examples/`: Input/output fixtures used by tests and AI generation.
- `bdd/`: Gherkin feature files for executable acceptance scenarios.
- `templates/`: Authoring templates.
- `glossary.md`: Shared domain terms.
- `decisions/`: Decision tables for ambiguous behavior.
- `traceability/`: Spec ID and mapping rules.

## Authoring Rules
1. One spec file per atomic behavior.
2. Use stable IDs: `<VIEW>.<SUBDOMAIN>.<NNN>` (example: `OFFERS.SEARCH.001`).
3. Use `shall` for normative requirements.
4. Include positive and edge scenarios.
5. Add data contracts only when data shape is relevant.
6. Do not describe implementation details (frameworks, storage engines, classes).

## Current Version
- Baseline: `v1.0`
- Product: `DealsSeeker`

