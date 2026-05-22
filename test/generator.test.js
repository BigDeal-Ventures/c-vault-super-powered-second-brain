const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { generateAll } = require('../lib/generator');
const { loadPacks } = require('../lib/pack-loader');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'c-vault-generator-'));
  write(path.join(root, 'packs/core/pack.json'), JSON.stringify({
    id: 'core',
    name: 'core',
    displayName: 'Core',
    description: 'Core workflows',
    version: '0.1.0',
  }, null, 2));
  write(path.join(root, 'packs/core/commands/daily-review.md'), [
    '---',
    'description: Review the day.',
    '---',
    '# Daily Review',
    'Use the vault to review the day.',
  ].join('\n'));
  write(path.join(root, 'packs/core/skills/obsidian-markdown/SKILL.md'), [
    '---',
    'name: obsidian-markdown',
    'description: Write Obsidian markdown.',
    '---',
    '# Obsidian Markdown',
  ].join('\n'));
  write(path.join(root, 'packs/core/skills/obsidian-markdown/references/style.md'), '# Style Reference\n');
  write(path.join(root, 'packs/core/templates/Daily Note.md'), '# Daily Note\n');
  write(path.join(root, 'packs/core/obsidian/00_Inbox/README.md'), '# Inbox\n');
  write(path.join(root, 'packs/core/instructions/operating-guide.md'), '# Operating Guide\n');
  write(path.join(root, 'packs/cmo-skills/pack.json'), JSON.stringify({
    id: 'cmo-skills',
    name: 'CMO Skills',
    displayName: 'CMO Skills',
    description: 'Marketing workflows',
    version: '1.6.0',
  }, null, 2));
  write(path.join(root, 'packs/cmo-skills/commands/cm-research.md'), [
    '---',
    'description: Research a market.',
    '---',
    '# CM Research',
    'Run the research workflow.',
  ].join('\n'));
  write(path.join(root, 'packs/cmo-skills/skills/positioning/SKILL.md'), [
    '---',
    'name: positioning',
    'description: Position a product.',
    '---',
    '# Positioning',
  ].join('\n'));
  write(path.join(root, 'packs/cmo-skills/skills/content-strategy/SKILL.md'), [
    '---',
    'name: content-strategy',
    'description: Plan content topics and editorial calendars.',
    '---',
    '# Content Strategy',
  ].join('\n'));
  return root;
}

test('loadPacks discovers valid packs and content counts', () => {
  const root = makeFixture();
  const packs = loadPacks(path.join(root, 'packs'));
  const core = packs.find((pack) => pack.id === 'core');

  assert.equal(packs.length, 2);
  assert.equal(core.name, 'core');
  assert.equal(core.commands.length, 1);
  assert.equal(core.skills.length, 1);
  assert.equal(core.templates.length, 1);
  assert.equal(core.obsidianFiles.length, 1);
});

test('generateAll writes tool adapters without machine-specific paths', () => {
  const root = makeFixture();
  const generatedRoot = path.join(root, 'generated');
  const result = generateAll({
    packsDir: path.join(root, 'packs'),
    outputDir: generatedRoot,
    packageVersion: '0.1.0',
  });

  assert.equal(result.packs, 2);
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/commands/daily-review.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/obsidian-markdown/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/obsidian-markdown/references/style.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/workflow-daily-review/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/using-c-vault/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/using-c-vault/references/routing.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex/.agents/skills/obsidian-markdown/references/style.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/.codex-plugin/plugin.json')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/commands/daily-review.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/workflow-daily-review/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/workflow-daily-review/agents/openai.yaml')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/positioning/agents/openai.yaml')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/using-c-vault/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/using-c-vault/references/routing.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/using-c-vault/agents/openai.yaml')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex/.agents/skills/using-c-vault/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex/.agents/skills/using-c-vault/references/routing.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex/.agents/skills/workflow-daily-review/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex/.agents/skills/workflow-daily-review/agents/openai.yaml')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'cursor/.cursor/rules/daily-review.mdc')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'opencode/.opencode/command/daily-review.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'obsidian/00_Inbox/README.md')));

  const codexShim = fs.readFileSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/commands/daily-review.md'), 'utf8');
  assert.match(codexShim, /pack: core/);
  assert.match(codexShim, /Use the vault to review the day/);
  assert.doesNotMatch(codexShim, /\/Users\/Chinmaya/);

  const plugin = JSON.parse(fs.readFileSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/.codex-plugin/plugin.json'), 'utf8'));
  assert.equal(plugin.skills, './skills/');

  const workflowSkill = fs.readFileSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/workflow-daily-review/SKILL.md'), 'utf8');
  assert.match(workflowSkill, /name: workflow-daily-review/);
  assert.match(workflowSkill, /Use the vault to review the day/);

  const claudeWorkflowSkill = fs.readFileSync(path.join(generatedRoot, 'claude-code/.claude/skills/workflow-daily-review/SKILL.md'), 'utf8');
  assert.match(claudeWorkflowSkill, /name: workflow-daily-review/);
  assert.match(claudeWorkflowSkill, /Use the vault to review the day/);
  assert.doesNotMatch(claudeWorkflowSkill, /plugin skill settings/);

  const routerSkill = fs.readFileSync(path.join(generatedRoot, 'claude-code/.claude/skills/using-c-vault/SKILL.md'), 'utf8');
  assert.match(routerSkill, /name: using-c-vault/);
  assert.match(routerSkill, /description: Use when/);
  assert.match(routerSkill, /use the Skill tool/i);
  assert.match(routerSkill, /Do not stop at naming the route/);
  assert.match(routerSkill, /references\/routing.md/);
  assert.doesNotMatch(routerSkill, /weekly review \/ synthesize my week/);

  const routing = fs.readFileSync(path.join(generatedRoot, 'claude-code/.claude/skills/using-c-vault/references/routing.md'), 'utf8');
  assert.match(routing, /\/daily-review/);
  assert.match(routing, /\/cm-research/);
  assert.match(routing, /content-strategy/);

  const workflowAgent = fs.readFileSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/workflow-daily-review/agents/openai.yaml'), 'utf8');
  assert.match(workflowAgent, /display_name: "Daily Review"/);
  assert.match(workflowAgent, /short_description:/);
});

test('generateAll filters packs by id', () => {
  const root = makeFixture();
  const generatedRoot = path.join(root, 'generated');
  const result = generateAll({
    packsDir: path.join(root, 'packs'),
    outputDir: generatedRoot,
    packageVersion: '0.1.0',
    packIds: ['core'],
  });

  assert.equal(result.packs, 1);
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/commands/daily-review.md')));
  assert.equal(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/commands/cm-research.md')), false);
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/using-c-vault/SKILL.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/workflow-daily-review/SKILL.md')));
  assert.equal(fs.existsSync(path.join(generatedRoot, 'claude-code/.claude/skills/workflow-cm-research/SKILL.md')), false);
  assert.equal(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/positioning/SKILL.md')), false);
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/using-c-vault/SKILL.md')));
  const routing = fs.readFileSync(path.join(generatedRoot, 'claude-code/.claude/skills/using-c-vault/references/routing.md'), 'utf8');
  assert.match(routing, /\/daily-review/);
  assert.doesNotMatch(routing, /\/cm-research/);
  assert.doesNotMatch(routing, /content-strategy/);
});
