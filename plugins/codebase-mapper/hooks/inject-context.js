#!/usr/bin/env node
/**
 * codebase-mapper - UserPromptSubmit context hook
 *
 * Re-injects the project's codebase map on every user prompt, when a map exists.
 *
 * This runs on UserPromptSubmit (not SessionStart) on purpose. A once-per-session
 * injection gets buried as the conversation grows, and Claude stops consulting the
 * map. Re-injecting on every prompt keeps it salient, so Claude actually reads the
 * relevant docs before working and refreshes them afterward.
 *
 * Each prompt it injects a short operating instruction plus INDEX.md (the compact
 * hub). The detailed atomic docs are read on demand. It does not touch CLAUDE.md.
 *
 * Design constraints:
 *   - No external dependencies (Node stdlib only).
 *   - Cross-platform (Windows / macOS / Linux).
 *   - Stays silent when there is no map for the project.
 *   - Never breaks a prompt: any error -> exit 0 with no output.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAP_DIR_PARTS = ['.claude', '.codebase-info'];
const INDEX_REL = '.claude/.codebase-info/INDEX.md';

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

  const context =
    '=== CODEBASE MAP (codebase-mapper) ===\n' +
    'This repository has a maintained codebase map in .claude/.codebase-info/. ' +
    'Before non-trivial work, read the relevant doc(s) for the area you are ' +
    'changing. After changes affecting architecture, directory structure, ' +
    'dependencies, the data model, entry points, APIs/events, or conventions, ' +
    'refresh it with the update-codebase-map skill ' +
    '(/codebase-mapper:update-codebase-map).\n\n' +
    '--- ' + INDEX_REL + ' ---\n' + indexContent.trim() + '\n';

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
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
