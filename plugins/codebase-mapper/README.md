# codebase-mapper

A self-maintaining, language-agnostic **codebase map** for Claude Code.

Map your project once into small, focused Markdown docs under `.claude/.codebase-info/`, keep them in
sync as the code changes, and have every Claude session start already grounded in how the project is
built.

## Install

```text
/plugin marketplace add Eigenwise/claude-toolshed
/plugin install codebase-mapper@claude-toolshed
```

## Skills

| Skill | Invoke with | Does |
|-------|-------------|------|
| `map-codebase` | "map the codebase", "onboard me", or `/codebase-mapper:map-codebase` | Builds the full atomic map |
| `update-codebase-map` | "update the codebase map", or `/codebase-mapper:update-codebase-map` | Refreshes only the docs affected by recent changes |

Works on any stack and on both existing and brand-new (greenfield) projects.

## What it creates

A set of atomic docs in `.claude/.codebase-info/` (only the ones that apply): `INDEX.md`,
`architecture.md`, `tech-landscape.md`, `directory-structure.md`, `entry-points.md`, `modules.md`,
`communication.md`, `database.md`, `dependencies.md`, `patterns.md`, `coding-style.md`, `docker.md`,
and `onboarding.md`. Plus a `.map-state.json` used to detect staleness on the next update.

## Auto-loading

A `UserPromptSubmit` hook (bundled, Node-based) re-injects the map on every prompt when one exists,
so it stays salient deep into a long session and Claude keeps consulting and updating it as you work.
It is silent in projects that have no map, and it never touches your `CLAUDE.md`.

Commit `.claude/.codebase-info/` so the whole team shares the map.

## Clean up

- Docs: delete `.claude/.codebase-info/`.
- Plugin: `/plugin uninstall codebase-mapper@claude-toolshed`.

## License

MIT © Eigenwise
