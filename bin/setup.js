#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { generateAll } = require('../lib/generator');
const { install, uninstall } = require('../lib/installer');

function parseArgs(argv) {
  const flags = {
    tool: 'auto',
    scope: 'project',
    target: process.cwd(),
    packs: [],
    dryRun: false,
    uninstall: false,
    force: false,
    backup: false,
    clean: false,
    help: false,
    version: false,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--uninstall') flags.uninstall = true;
    else if (arg === '--force') flags.force = true;
    else if (arg === '--backup') flags.backup = true;
    else if (arg === '--clean') flags.clean = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--version' || arg === '-v') flags.version = true;
    else if (arg.startsWith('--tool=')) flags.tool = arg.slice('--tool='.length);
    else if (arg.startsWith('--scope=')) flags.scope = arg.slice('--scope='.length);
    else if (arg.startsWith('--target=')) flags.target = arg.slice('--target='.length);
    else if (arg.startsWith('--packs=')) flags.packs = arg.slice('--packs='.length).split(',').map((value) => value.trim()).filter(Boolean);
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return flags;
}

function helpText() {
  return `C-Vault - Super Powered Second Brain

Usage:
  c-vault [options]

Options:
  --tool=auto|claude-code|codex|cursor|opencode|obsidian
  --scope=project|global
  --target=/path/to/vault
  --dry-run
  --uninstall
  --force       overwrite or remove modified C-Vault-tracked files
  --backup      create .bak files before forced overwrite/removal
  --clean       remove obsolete C-Vault-tracked files during update
  --version
  --help
`;
}

function formatSummary(summary) {
  const parts = [
    `create ${summary.create || 0}`,
    `update ${summary.update || 0}`,
    `unchanged ${summary.unchanged || 0}`,
    `force-overwrite ${summary.forceOverwrite || 0}`,
    `remove ${summary.remove || 0}`,
    `force-remove ${summary.forceRemove || 0}`,
    `kept-obsolete ${summary.orphan || 0}`,
    `conflicts ${summary.conflict || 0}`,
    `orphan-conflicts ${summary.orphanConflict || 0}`,
  ];
  return parts.join(', ');
}

function logConflicts(result, log) {
  if (!result.conflicts || result.conflicts.length === 0) {
    return;
  }
  log('Skipped modified files. Re-run with --force to overwrite, or --force --backup to preserve .bak copies first.');
  for (const conflict of result.conflicts.slice(0, 10)) {
    log(`  ${conflict.destination}`);
  }
  if (result.conflicts.length > 10) {
    log(`  ...and ${result.conflicts.length - 10} more`);
  }
}

function logSkippedUninstall(result, log) {
  if (!result.skipped || result.skipped.length === 0) {
    return;
  }
  log('Skipped modified tracked files during uninstall. Re-run with --force to remove, or --force --backup to preserve .bak copies first.');
  for (const entry of result.skipped.slice(0, 10)) {
    log(`  ${entry.path}`);
  }
  if (result.skipped.length > 10) {
    log(`  ...and ${result.skipped.length - 10} more`);
  }
}

function run(options = {}) {
  const flags = parseArgs(options.argv || process.argv.slice(2));
  const repoRoot = options.repoRoot || path.resolve(__dirname, '..');
  const log = options.log || console.log;

  if (flags.help) {
    log(helpText());
    return { help: true };
  }
  if (flags.version) {
    const version = require('../package.json').version;
    log(version);
    return { version };
  }
  if (flags.uninstall) {
    const result = uninstall({
      target: flags.target,
      dryRun: flags.dryRun,
      force: flags.force,
      backup: flags.backup,
    });
    log(flags.dryRun
      ? `Would remove ${result.removedFiles} files and skip ${result.skippedFiles || 0} modified files.`
      : `Removed ${result.removedFiles} files and skipped ${result.skippedFiles || 0} modified files.`);
    logSkippedUninstall(result, log);
    return result;
  }

  const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'c-vault-install-'));
  generateAll({
    repoRoot,
    outputDir: path.join(workRoot, 'generated'),
    packIds: flags.packs,
  });
  const result = install({
    repoRoot: workRoot,
    target: flags.target,
    tool: flags.tool,
    scope: flags.scope,
    dryRun: flags.dryRun,
    force: flags.force,
    backup: flags.backup,
    clean: flags.clean,
  });
  log(flags.dryRun
    ? `Install plan for ${result.target}: ${formatSummary(result.summary)}.`
    : `Install complete for ${result.target}: ${formatSummary(result.summary)}.`);
  logConflicts(result, log);
  return result;
}

function main() {
  run();
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { parseArgs, run };
