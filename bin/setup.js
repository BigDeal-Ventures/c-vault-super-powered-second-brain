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
  --version
  --help
`;
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
    const result = uninstall({ target: flags.target, dryRun: flags.dryRun });
    log(flags.dryRun ? `Would remove ${result.removedFiles} files.` : `Removed ${result.removedFiles} files.`);
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
  });
  log(flags.dryRun ? `Would copy ${result.actions.length} files to ${result.target}.` : `Installed ${result.actions.length} files to ${result.target}.`);
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
