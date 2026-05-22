#!/usr/bin/env node
const path = require('node:path');
const { generateAll } = require('../lib/generator');
const { install, uninstall } = require('../lib/installer');

function parseArgs(argv) {
  const flags = {
    tool: 'auto',
    scope: 'project',
    target: process.cwd(),
    dryRun: false,
    uninstall: false,
    help: false,
    version: false,
  };

  for (const arg of argv) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--uninstall') flags.uninstall = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--version' || arg === '-v') flags.version = true;
    else if (arg.startsWith('--tool=')) flags.tool = arg.slice('--tool='.length);
    else if (arg.startsWith('--scope=')) flags.scope = arg.slice('--scope='.length);
    else if (arg.startsWith('--target=')) flags.target = arg.slice('--target='.length);
    else if (arg.startsWith('--packs=')) {
      // Pack filtering is reserved for the next release; all packs are generated in v0.1.
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return flags;
}

function printHelp() {
  console.log(`C-Vault - Super Powered Second Brain

Usage:
  c-vault [options]

Options:
  --tool=auto|claude-code|codex|cursor|opencode|obsidian
  --scope=project|global
  --target=/path/to/vault
  --dry-run
  --uninstall
  --version
  --help
`);
}

function main() {
  const flags = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(__dirname, '..');

  if (flags.help) {
    printHelp();
    return;
  }
  if (flags.version) {
    console.log(require('../package.json').version);
    return;
  }
  if (flags.uninstall) {
    const result = uninstall({ target: flags.target, dryRun: flags.dryRun });
    console.log(flags.dryRun ? `Would remove ${result.removedFiles} files.` : `Removed ${result.removedFiles} files.`);
    return;
  }

  generateAll({ repoRoot });
  const result = install({
    repoRoot,
    target: flags.target,
    tool: flags.tool,
    scope: flags.scope,
    dryRun: flags.dryRun,
  });
  console.log(flags.dryRun ? `Would copy ${result.actions.length} files to ${result.target}.` : `Installed ${result.actions.length} files to ${result.target}.`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
