# codebase-mapper

A self-maintaining, language-agnostic **codebase map** for Claude Code.

Map your project once into small, focused Markdown docs under `.claude/.codebase-info/`, keep them in
sync as the code changes, and have every Claude session start already grounded in how the project is
built — instead of re-discovering it each time.

## Install

```text
/plugin marketplace add Eigenwise/claude-toolshed
/plugin install codebase-mapper@claude-toolshed
```

## Skills

| Skill | Invoke with | Does |
|-------|-------------|------|
| `map-codebase` | "map the codebase", "onboard me", or `/codebase-mapper:map-codebase` | Builds the full atomic map and wires up auto-loading |
| `update-codebase-map` | "update the codebase map", or `/codebase-mapper:update-codebase-map` | Refreshes only the docs affected by recent changes |

Works on any stack and on both existing and brand-new (greenfield) projects.

## What it creates

A set of atomic docs in `.claude/.codebase-info/` (only the ones that apply) — `INDEX.md`,
`architecture.md`, `tech-landscape.md`, `directory-structure.md`, `entry-points.md`, `modules.md`,
`communication.md`, `database.md`, `dependencies.md`, `patterns.md`, `coding-style.md`, `docker.md`,
`onboarding.md` — plus a `.map-state.json` used to detect staleness on the next update.

## Auto-loading (belt & suspenders)

1. **CLAUDE.md import** — a managed block in your project's `CLAUDE.md` that `@`-imports `INDEX.md`.
   Native, zero-dependency, loaded every session, shared via git.
2. **SessionStart hook** — injects the map when the `CLAUDE.md` block isn't carrying it. Silent when
   no map exists; never duplicates what the belt already loaded. Runs on Node (bundled with most
   Claude Code installs).

Commit `.claude/.codebase-info/` and the `CLAUDE.md` block so the whole team shares the map.

## Clean up

- Auto-loading: remove the block between `<!-- codebase-mapper:start -->` and
  `<!-- codebase-mapper:end -->` in `CLAUDE.md`.
- Docs: delete `.claude/.codebase-info/`.
- Plugin: `/plugin uninstall codebase-mapper@claude-toolshed`.

## License

MIT © Eigenwise
