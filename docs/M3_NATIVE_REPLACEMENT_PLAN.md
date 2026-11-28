# Plan — replace the authored brand world with Material 3 defaults (Android phase)

The user has explicitly chosen full MCP/Paper conformance over the previously authored identity. This is a replacement, not a polish pass.

## Retire
- Trail Map as the governing north star; the single waypoint accent rule.
- Fixed night-footer surface; authored deep-slate tab bar and active waypoint tile.
- Pill-only controls and the one-ambient-shadow rule as brand constraints (M3 shape/elevation tokens govern instead).
- "Two deliberate exceptions" in the prior report:
  1. Standard tab destinations keep React Navigation native headers → replace with Paper `Appbar` headers.
  2. Coverage radios and the immersive rail stay authored `Pressable`s → replace with Paper `RadioButton` and `IconButton`/`Button`, preserving accessibility state and touch floors through M3 components.

## Adopt
- M3 color roles from the Design MCP for all three seed worlds in light/dark, used directly as the app's colors; no second accent language.
- M3 type scale and Material Symbols via Paper/verified names; no Georgia/serif landmark exception — M3 type roles govern.
- M3 shapes (fully rounded where M3 specifies) and tonal elevation via Paper `Surface`/elevation tokens.
- Motion physics/removed-animation semantics from Material 3 via Paper defaults.

## Guardrails still in force
- Behavior, copy semantics, privacy (no raw coordinates), auth/guest rules, undo, recents, draft recovery, contextual help, keyboard/IME and touch floors remain unchanged.
- Spec-first: amend DESIGN.md and the affected specs/BDD, approve, then implement TDD.
- Verify: full Jest/typecheck/arch, Android emulator screenshots and hierarchy, then a fresh Impeccable critique/audit.
