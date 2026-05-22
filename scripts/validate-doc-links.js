#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { listFiles } = require('../lib/fs-utils');

const root = path.resolve(__dirname, '..');
const docRoots = [
  'README.md',
  'docs',
  'packs/core/obsidian',
  'generated/common/06_Metadata/Reference',
  'generated/obsidian',
  'generated/claude-desktop',
];

function markdownFiles(target) {
  const absolute = path.join(root, target);
  if (!fs.existsSync(absolute)) return [];
  if (fs.statSync(absolute).isFile()) return absolute.endsWith('.md') ? [absolute] : [];
  return listFiles(absolute).filter((file) => file.endsWith('.md'));
}

function isExternal(href) {
  return /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(href);
}

function normalizeHref(rawHref) {
  const href = rawHref.trim().replace(/^<|>$/g, '');
  const withoutAnchor = href.split('#')[0];
  return withoutAnchor;
}

const failures = [];
const files = docRoots.flatMap(markdownFiles);
const linkPattern = /!?\[[^\]]+\]\(([^)]+)\)/g;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(linkPattern)) {
    const href = normalizeHref(match[1]);
    if (!href || isExternal(href)) continue;
    const target = path.resolve(path.dirname(file), href);
    if (!fs.existsSync(target)) {
      failures.push(`${path.relative(root, file)} links to missing target: ${match[1]}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated markdown links in ${files.length} docs.`);
