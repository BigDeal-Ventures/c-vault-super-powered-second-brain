const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildInstallPlan, install, uninstall } = require('../lib/installer');

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
  assert.equal(fs.existsSync(target), false);
});
