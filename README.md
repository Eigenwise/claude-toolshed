# 🧰 claude-toolshed

A small marketplace of [Claude Code](https://code.claude.com) plugins by **Eigenwise**.

| Plugin | What it does |
|--------|--------------|
| [**codebase-mapper**](./plugins/codebase-mapper) | Generates a self-maintaining, language-agnostic map of your codebase and auto-loads it into every Claude session. |

---

## Install

```text
/plugin marketplace add Eigenwise/claude-toolshed
/plugin install codebase-mapper@claude-toolshed
```

Then reload (`/reload-plugins`, or restart Claude Code).

> This repo is **private**. Installing it on another machine, or letting collaborators use it,
> needs read access to the repo — see [Access & sharing](#access--sharing). To open it up to anyone,
> make the repo public.

You can also add it from a local clone while developing:

```text
/plugin marketplace add /path/to/claude-toolshed
```

---

## codebase-mapper

### The problem

On any non-trivial codebase, a fresh Claude session starts blind. It re-discovers the architecture,
re-greps for entry points, and re-learns your conventions — every single time. That's slow, wastes
tokens, and leads to changes that don't fit how the project is actually built.

### The idea

Map the codebase **once** into a set of small, focused Markdown docs, then keep that map in sync as
the code changes — and make sure every session starts already grounded in it.

```
.claude/.codebase-info/
├── INDEX.md                # compact hub — this is what auto-loads each session
├── architecture.md         # components, boundaries, data flow
├── tech-landscape.md       # languages, frameworks, infra
├── directory-structure.md  # annotated tree
├── entry-points.md         # routes / CLIs / jobs / main files
├── modules.md              # key modules: purpose, deps, exports
├── communication.md        # APIs, events, integrations      (if applicable)
├── database.md             # schema & relationships          (if applicable)
├── dependencies.md         # categorized packages            (if applicable)
├── patterns.md             # patterns, error handling, tests, config
├── coding-style.md         # conventions from linters + code
├── docker.md               # containers / local dev          (if applicable)
├── onboarding.md           # quick start + common tasks
└── .map-state.json         # last-mapped commit + date (for staleness checks)
```

**Atomic docs** mean updates stay small and reviewable — when you add a database, only `database.md`
and the index change, not one giant file.

### Usage

| You say… | Skill | Result |
|----------|-------|--------|
| "map the codebase", "onboard me to this project", "document the architecture" | `map-codebase` | Builds the full map and wires up auto-loading |
| "update the codebase map", "the docs are stale", "sync the docs" | `update-codebase-map` | Refreshes only the docs affected by recent changes |

Or invoke them directly: `/codebase-mapper:map-codebase`, `/codebase-mapper:update-codebase-map`.
Claude is also nudged to refresh the map on its own after changes that affect the architecture.

Works on **any stack** (broad detection across JS/TS, Python, Go, Rust, Java/Kotlin, .NET, Ruby,
PHP, Swift, Elixir, C/C++, Dart, monorepos, …) and on **both existing projects and brand-new ones** —
a greenfield repo gets a lean "intent" map that grows as you build.

### How auto-loading works (belt & suspenders)

The map is surfaced into context two complementary ways, so it works whether or not you have a
particular runtime or file:

1. **CLAUDE.md import (the belt).** `map-codebase` adds a small managed block to your project's
   `CLAUDE.md` that points to — and `@`-imports — `INDEX.md`. This is a native Claude Code feature:
   zero dependencies, loaded every session, and shared with your team through git.
2. **SessionStart hook (the suspenders).** The plugin ships a `SessionStart` hook that injects the
   map when the `CLAUDE.md` block isn't carrying it (no `CLAUDE.md`, a declined import, a removed
   block). It stays silent in projects that have no map, and it never re-dumps content the belt
   already loaded — so there's no wasteful duplication.

> The hook runs on Node (which ships with most Claude Code installs); the CLAUDE.md belt is the
> zero-dependency fallback if Node isn't available.

This is the main upgrade over the original design, which re-injected the entire index on **every**
prompt via a required Python hook. v2 injects **once per session**, prefers a native zero-dependency
path, and drops the per-message ritual.

### Keep it in git

Commit `.claude/.codebase-info/` and the managed `CLAUDE.md` block. Then the map is shared: every
teammate and every Claude session starts from the same understanding, and the map travels with the
code.

### Uninstall / clean up

- Remove auto-loading: delete the `codebase-mapper` block in `CLAUDE.md` (between the
  `<!-- codebase-mapper:start -->` / `<!-- codebase-mapper:end -->` markers).
- Remove the docs: delete `.claude/.codebase-info/`.
- Remove the plugin: `/plugin uninstall codebase-mapper@claude-toolshed`.

---

## Access & sharing

Because the repo is private:

- **Manual install** uses your existing git credentials (`gh auth login`, Git Credential Manager,
  etc.) — same as cloning a private repo.
- **Background auto-update** is non-interactive, so it needs a token in the environment. Set
  `GITHUB_TOKEN` (or `GH_TOKEN`) to a token with `repo` scope.
- **To let anyone install it,** make the repo public:
  ```bash
  gh repo edit Eigenwise/claude-toolshed --visibility public
  ```

## Compatibility

Needs a recent Claude Code (plugin marketplaces, skills, and `SessionStart` hooks). The hook uses
Node; if Node isn't present, the CLAUDE.md import still provides the map.

## License

[MIT](./LICENSE) © Eigenwise
