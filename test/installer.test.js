const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildInstallPlan, install, uninstall } = require('../lib/installer');
const { parseArgs, run } = require('../bin/setup');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function makeGeneratedFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'c-vault-installer-'));
  write(path.join(root, 'generated/claude-code/.claude/commands/daily-review.md'), '# Daily Review\n');
  write(path.join(root, 'generated/claude-code/.claude/skills/obsidian-markdown/SKILL.md'), '# Skill\n');
  write(path.join(root, 'generated/codex/.agents/skills/obsidian-markdown/SKILL.md'), '# Skill\n');
  write(path.join(root, 'generated/cursor/.cursor/rules/daily-review.mdc'), '# Rule\n');
  write(path.join(root, 'generated/opencode/.opencode/command/daily-review.md'), '# Command\n');
  write(path.join(root, 'generated/obsidian/00_Inbox/README.md'), '# Inbox\n');
  write(path.join(root, 'generated/common/AGENTS.md'), '# Agents\n');
  write(path.join(root, 'generated/common/CLAUDE.md'), '# Claude\n');
  return root;
}

test('buildInstallPlan maps auto installs to all generated surfaces', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  const plan = buildInstallPlan({
    repoRoot: root,
    target,
    tool: 'auto',
    scope: 'project',
  });

  assert.ok(plan.actions.some((action) => action.destination.endsWith('.claude/commands/daily-review.md')));
  assert.ok(plan.actions.some((action) => action.destination.endsWith('.agents/skills/obsidian-markdown/SKILL.md')));
  assert.ok(plan.actions.some((action) => action.destination.endsWith('.cursor/rules/daily-review.mdc')));
  assert.ok(plan.actions.some((action) => action.destination.endsWith('.opencode/command/daily-review.md')));
  assert.ok(plan.actions.some((action) => action.destination.endsWith('00_Inbox/README.md')));
});

test('buildInstallPlan de-duplicates identical generated destinations', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  write(path.join(root, 'generated/codex/AGENTS.md'), '# Shared Agents\n');
  write(path.join(root, 'generated/common/AGENTS.md'), '# Shared Agents\n');

  const plan = buildInstallPlan({ repoRoot: root, target, tool: 'auto', scope: 'project' });

  assert.equal(plan.actions.filter((action) => action.destination.endsWith('AGENTS.md')).length, 1);
});

test('buildInstallPlan rejects conflicting generated destinations', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  write(path.join(root, 'generated/codex/AGENTS.md'), '# Codex Agents\n');
  write(path.join(root, 'generated/common/AGENTS.md'), '# Common Agents\n');

  assert.throws(
    () => buildInstallPlan({ repoRoot: root, target, tool: 'auto', scope: 'project' }),
    /Conflicting generated outputs target the same path/,
  );
});

test('install writes a manifest and uninstall removes tracked files', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');

  const result = install({
    repoRoot: root,
    target,
    tool: 'claude-code',
    scope: 'project',
    dryRun: false,
  });

  assert.equal(result.dryRun, false);
  assert.ok(fs.existsSync(path.join(target, '.claude/commands/daily-review.md')));
  assert.ok(fs.existsSync(path.join(target, '.c-vault-install.json')));
  const manifest = JSON.parse(fs.readFileSync(path.join(target, '.c-vault-install.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.files[0].path.startsWith(target), true);
  assert.match(manifest.files[0].installedHash, /^sha256:/);

  const removed = uninstall({ target, dryRun: false });
  assert.ok(removed.removedFiles >= 1);
  assert.equal(fs.existsSync(path.join(target, '.claude/commands/daily-review.md')), false);
});

test('dry-run returns planned actions without writing files', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  const result = install({
    repoRoot: root,
    target,
    tool: 'codex',
    scope: 'project',
    dryRun: true,
  });

  assert.equal(result.dryRun, true);
  assert.ok(result.actions.length > 0);
  assert.ok(result.summary.create > 0);
  assert.equal(fs.existsSync(target), false);
});

test('update skips user-modified files by default', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  install({ repoRoot: root, target, tool: 'claude-code', scope: 'project', dryRun: false });

  const commandPath = path.join(target, '.claude/commands/daily-review.md');
  write(commandPath, '# User Custom Daily Review\n');
  write(path.join(root, 'generated/claude-code/.claude/commands/daily-review.md'), '# New Upstream Daily Review\n');

  const result = install({ repoRoot: root, target, tool: 'claude-code', scope: 'project', dryRun: false });

  assert.equal(fs.readFileSync(commandPath, 'utf8'), '# User Custom Daily Review\n');
  assert.equal(result.summary.conflict, 1);
  assert.equal(result.conflicts[0].destination, commandPath);
});

test('force update with backup preserves modified file before overwriting', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  install({ repoRoot: root, target, tool: 'claude-code', scope: 'project', dryRun: false });

  const commandPath = path.join(target, '.claude/commands/daily-review.md');
  write(commandPath, '# User Custom Daily Review\n');
  write(path.join(root, 'generated/claude-code/.claude/commands/daily-review.md'), '# New Upstream Daily Review\n');

  const result = install({ repoRoot: root, target, tool: 'claude-code', scope: 'project', dryRun: false, force: true, backup: true });

  assert.equal(fs.readFileSync(commandPath, 'utf8'), '# New Upstream Daily Review\n');
  assert.equal(fs.readFileSync(`${commandPath}.bak`, 'utf8'), '# User Custom Daily Review\n');
  assert.equal(result.summary.forceOverwrite, 1);
});

test('uninstall skips modified tracked files unless forced', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  install({ repoRoot: root, target, tool: 'claude-code', scope: 'project', dryRun: false });

  const commandPath = path.join(target, '.claude/commands/daily-review.md');
  write(commandPath, '# User Custom Daily Review\n');

  const result = uninstall({ target, dryRun: false });

  assert.equal(result.skippedFiles, 1);
  assert.equal(fs.readFileSync(commandPath, 'utf8'), '# User Custom Daily Review\n');
  assert.ok(fs.existsSync(path.join(target, '.c-vault-install.json')));
});

test('clean update removes unchanged orphaned files from previous manifest', () => {
  const root = makeGeneratedFixture();
  const target = path.join(root, 'target');
  install({ repoRoot: root, target, tool: 'claude-code', scope: 'project', dryRun: false });

  const skillPath = path.join(target, '.claude/skills/obsidian-markdown/SKILL.md');
  fs.rmSync(path.join(root, 'generated/claude-code/.claude/skills/obsidian-markdown/SKILL.md'));

  const result = install({ repoRoot: root, target, tool: 'claude-code', scope: 'project', dryRun: false, clean: true });

  assert.equal(result.summary.remove, 1);
  assert.equal(fs.existsSync(skillPath), false);
});

test('setup parser keeps pack filters from --packs', () => {
  const flags = parseArgs(['--tool=codex', '--packs=core,cmo-skills', '--dry-run', '--force', '--backup', '--clean']);

  assert.equal(flags.tool, 'codex');
  assert.deepEqual(flags.packs, ['core', 'cmo-skills']);
  assert.equal(flags.dryRun, true);
  assert.equal(flags.force, true);
  assert.equal(flags.backup, true);
  assert.equal(flags.clean, true);
});

test('setup dry-run with pack filter does not rewrite repo generated output', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'c-vault-setup-'));
  write(path.join(root, 'package.json'), JSON.stringify({ version: '0.1.0' }));
  write(path.join(root, 'packs/core/pack.json'), JSON.stringify({
    id: 'core',
    name: 'Core',
    version: '0.1.0',
    description: 'Core pack',
  }));
  write(path.join(root, 'packs/core/commands/daily-review.md'), '# Daily Review\n');
  write(path.join(root, 'packs/cmo-skills/pack.json'), JSON.stringify({
    id: 'cmo-skills',
    name: 'CMO Skills',
    version: '1.6.0',
    description: 'CMO pack',
  }));
  write(path.join(root, 'packs/cmo-skills/commands/cm-research.md'), '# CM Research\n');
  write(path.join(root, 'generated/sentinel.txt'), 'keep me\n');

  const result = run({
    argv: ['--tool=codex', '--packs=core', '--dry-run', `--target=${path.join(root, 'target')}`],
    repoRoot: root,
    log: () => {},
  });

  assert.equal(result.actions.some((action) => action.destination.endsWith('cm-research.md')), false);
  assert.equal(fs.readFileSync(path.join(root, 'generated/sentinel.txt'), 'utf8'), 'keep me\n');
});
