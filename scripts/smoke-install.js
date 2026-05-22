#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { install } = require('../lib/installer');

const repoRoot = path.resolve(__dirname, '..');
const tools = ['claude-code', 'codex', 'cursor', 'opencode', 'obsidian', 'auto'];

for (const tool of tools) {
  const target = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'c-vault-smoke-')), 'target');
  const result = install({ repoRoot, target, tool, scope: 'project', dryRun: true });
  if (result.actions.length === 0) {
    throw new Error(`${tool}: dry-run produced no actions`);
  }
}

console.log(`Smoke dry-run passed for ${tools.length} tools.`);
