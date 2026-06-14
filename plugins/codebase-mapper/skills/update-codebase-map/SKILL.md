---
name: update-codebase-map
description: >-
  Refresh an existing codebase map in .claude/.codebase-info/ so it reflects the current code.
  Detects what changed since the map was last written, updates only the affected atomic docs, and
  re-records state. Use when the user asks to "update the codebase map", "refresh codebase docs",
  "sync documentation", "the docs are stale", "update architecture docs", or after a change that
  affects architecture, structure, dependencies, the data model, entry points, APIs/events, or
  conventions. If there's no .claude/.codebase-info/ yet, use map-codebase instead.
---

# Update Codebase Map

Bring an existing map up to date with surgical edits — detect changes, touch only the affected
documents, keep everything internally consistent. This is a refresh, **not** a full rewrite.

## Prerequisite

A `.claude/.codebase-info/` directory with `INDEX.md` must already exist. If it doesn't, stop and
use the `map-codebase` skill to create the initial map.

## Process

### Step 1 — Load current state

Read `.claude/.codebase-info/.map-state.json` to get `gitCommit`, `mappedAt`, and the list of
existing `documents`. Skim `INDEX.md` to recall what's already covered. (If `.map-state.json` is
missing — e.g. a map from an older version — fall back to the `mappedAt` date in `INDEX.md`, and
plan to write a fresh `.map-state.json` at the end.)

### Step 2 — Detect what changed

**Git repo (preferred — precise):** diff against the last-mapped commit.
```bash
git diff --stat <gitCommit>..HEAD          # which files changed, added, deleted
git log --oneline <gitCommit>..HEAD        # what the changes were about
git diff <gitCommit>..HEAD -- package.json pyproject.toml go.mod Cargo.toml composer.json Gemfile   # dependency churn (adjust to the project's manifests)
```

**No git, or no stored commit (fallback):** find source files modified since the map was written.
```bash
# files newer than the index (skip noise dirs)
find . -type f -newer .claude/.codebase-info/INDEX.md \
  -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/vendor/*' \
  -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/target/*' -not -path '*/.venv/*'
```

### Step 3 — Map changes to documents

| If this changed… | Update… |
|------------------|---------|
| Directory layout (folders added/removed/renamed) | `directory-structure.md` |
| Components / services / module boundaries | `architecture.md`, `modules.md` |
| New/removed routes, CLI commands, jobs, handlers | `entry-points.md` |
| API contracts, events, queues, integrations | `communication.md` |
| Schema, migrations, new tables/collections | `database.md` |
| Dependency manifest (added/removed/upgraded) | `dependencies.md`, maybe `tech-landscape.md` |
| Design patterns, error handling, test setup, config | `patterns.md` |
| Linter/formatter config or naming conventions | `coding-style.md` |
| Container/compose setup | `docker.md` |
| Setup steps or common workflows | `onboarding.md` |
| Project name/description, or any doc added/removed | `INDEX.md` |

Prioritize structural changes (new/removed entry points, components, infra, data model) over cosmetic
ones. Skip pure internal refactors that don't change any documented interface, layout, or convention.

### Step 4 — Apply targeted edits

For each affected document:
1. Read it.
2. Make focused edits — change only what's now different; don't rewrite the whole file.
3. Update its `*Last Updated: YYYY-MM-DD*` line to today's real date.

Handle structural shifts:
- **New area that has no doc yet** (e.g. a `Dockerfile` or first database appeared): create the
  document from the matching template in
  `../map-codebase/references/document-templates.md`, then add it to `INDEX.md` and to the
  `documents` list in state.
- **Removed area** (e.g. a service or integration is gone): delete the now-empty doc (and its
  `INDEX.md` row), or prune the stale sections from a shared doc. Remove orphaned references.

### Step 5 — Re-record state

Rewrite `.claude/.codebase-info/.map-state.json`:
- `mappedAt`: today's date
- `gitCommit`: current `git rev-parse HEAD` (or `null` if not a git repo)
- `documents`: the current set of docs (reflecting any added/removed)
- keep `tool` and bump `version` to match the plugin if needed

Then summarize for the user: which docs you updated, created, or removed, and why. Remind them to
commit the changes so the team and future sessions stay in sync.

## Guidelines

- **Surgical, not sweeping.** Targeted edits keep diffs reviewable and history meaningful.
- **Verify before writing.** Every path you add must exist; every path you remove must really be
  gone.
- **No churn for churn's sake.** If nothing meaningful changed, say so and update only the
  `mappedAt`/`gitCommit` in state (or nothing at all).
- **Never touch `CLAUDE.md`.** The plugin's hook handles loading; the map lives entirely in
  `.claude/.codebase-info/`. Leave `CLAUDE.md` (and `CLAUDE.local.md`) alone.

## Success criteria

- [ ] Changes since the last map detected (via stored commit, or mtime fallback)
- [ ] Only affected documents edited; new areas documented; removed areas pruned
- [ ] `INDEX.md` reflects any added/removed docs
- [ ] `Last Updated` dates current on every touched doc
- [ ] `CLAUDE.md` left untouched
- [ ] `.map-state.json` rewritten with today's date, current commit, and document list
