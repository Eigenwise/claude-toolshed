#!/usr/bin/env node
/**
 * codebase-mapper - SessionStart context hook
 *
 * Injects the project's codebase map into the session, when one exists.
 *
 * Belt & suspenders. The "belt" is a managed block in the project's CLAUDE.md
 * (written by the map-codebase skill) that points to - and @imports - the map.
 * This hook is the "suspenders". To stay useful without duplicating the belt:
 *
 *   - It ALWAYS injects a short operating protocol. This is cheap and keeps the
 *     "read before / update after" habit salient at every session start,
 *     including after context compaction.
 *   - It injects the FULL index ONLY when the CLAUDE.md managed block is absent
 *     (the belt isn't carrying the content). That way the map still reaches
 *     Claude with no CLAUDE.md, a declined @import, or a hand-removed block.
 *
 * Design constraints:
 *   - No external dependencies (Node stdlib only). Node ships with most Claude
 *     Code installs; if it is missing, the CLAUDE.md belt covers the map.
 *   - Cross-platform (Windows / macOS / Linux).
 *   - Never breaks a session: any error -> exit 0 with no output.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAP_DIR_PARTS = ['.claude', '.codebase-info'];
const DISPLAY_DIR = '.claude/.codebase-info';
const INDEX_REL = '.claude/.codebase-info/INDEX.md';
const MANAGED_MARKER = 'codebase-mapper:start';

function readStdinCwd() {
  // Hook input arrives as JSON on stdin; cwd is a fallback for project dir.
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw) return '';
    const data = JSON.parse(raw);
    return data && typeof data.cwd === 'string' ? data.cwd : '';
  } catch (_) {
    return '';
  }
}

function fileIncludes(file, needle) {
  try {
    return fs.readFileSync(file, 'utf8').includes(needle);
  } catch (_) {
    return false;
  }
}

function main() {
  const projectDir =
    process.env.CLAUDE_PROJECT_DIR || readStdinCwd() || process.cwd();

  const indexPath = path.join(projectDir, ...MAP_DIR_PARTS, 'INDEX.md');

  let indexContent;
  try {
    indexContent = fs.readFileSync(indexPath, 'utf8');
  } catch (_) {
    // No map for this project - stay completely silent.
    process.exit(0);
  }

  // Is the CLAUDE.md "belt" already carrying the map?
  const beltActive =
    fileIncludes(path.join(projectDir, 'CLAUDE.md'), MANAGED_MARKER) ||
    fileIncludes(path.join(projectDir, 'CLAUDE.local.md'), MANAGED_MARKER);

  let context =
    '=== CODEBASE MAP (codebase-mapper) ===\n' +
    'This project has a maintained codebase map in ' + DISPLAY_DIR + '/.\n' +
    '- Before non-trivial work, read the relevant doc(s). The index is ' +
    INDEX_REL + '.\n' +
    '- After changes affecting architecture, structure, dependencies, data ' +
    'model, entry points, APIs/events, or conventions, refresh it with the ' +
    'update-codebase-map skill (/codebase-mapper:update-codebase-map).\n';

  if (!beltActive) {
    context +=
      '\n--- ' + INDEX_REL + ' ---\n' + indexContent.trim() + '\n';
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: context,
      },
    })
  );
  process.exit(0);
}

try {
  main();
} catch (_) {
  process.exit(0);
}
