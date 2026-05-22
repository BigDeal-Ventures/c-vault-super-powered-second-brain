#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { listFiles } = require('../lib/fs-utils');

const root = path.resolve(__dirname, '..');
const generated = path.join(root, 'generated');
const required = [
  'claude-code/.claude/commands',
  'codex/.agents/skills',
  'codex-plugin/plugins/c-vault/.codex-plugin/plugin.json',
  'codex-plugin/.agents/plugins/marketplace.json',
  'cursor/.cursor/rules',
  'opencode/.opencode/command',
  'obsidian/00_Inbox/README.md',
];
const failures = [];
const secretPattern = /(?:AIza[0-9A-Za-z_-]{20,}|pplx-[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z_-]{20,})/;
const machinePathPattern = /\/Users\/[A-Za-z0-9._-]+/;

for (const rel of required) {
  if (!fs.existsSync(path.join(generated, rel))) failures.push(`Missing generated output: ${rel}`);
}

for (const file of listFiles(generated)) {
  const text = fs.readFileSync(file, 'utf8');
  if (machinePathPattern.test(text)) failures.push(`Machine path in ${file}`);
  if (secretPattern.test(text)) failures.push(`Secret-like token in ${file}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Generated outputs validated.');
