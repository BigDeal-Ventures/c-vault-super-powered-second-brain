#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { listFiles } = require('../lib/fs-utils');
const { loadPacks } = require('../lib/pack-loader');

const root = path.resolve(__dirname, '..');
const packs = loadPacks(path.join(root, 'packs'));
const failures = [];
const secretPattern = /(?:AIza[0-9A-Za-z_-]{20,}|pplx-[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z_-]{20,})/;
const machinePathPattern = /\/Users\/[A-Za-z0-9._-]+/;

if (packs.length === 0) failures.push('No packs found.');

for (const pack of packs) {
  if (!pack.version) failures.push(`${pack.name}: missing version`);
  if (!pack.description) failures.push(`${pack.name}: missing description`);
  if (pack.commands.length === 0 && pack.skills.length === 0 && pack.obsidianFiles.length === 0) {
    failures.push(`${pack.name}: no commands, skills, or obsidian files`);
  }
  for (const filePath of listFiles(pack.root)) {
    const relativePath = path.relative(pack.root, filePath);
    const text = fs.readFileSync(filePath, 'utf8');
    if (machinePathPattern.test(text)) failures.push(`${pack.name}: machine path in ${relativePath}`);
    if (secretPattern.test(text)) failures.push(`${pack.name}: secret-like token in ${relativePath}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${packs.length} packs.`);
