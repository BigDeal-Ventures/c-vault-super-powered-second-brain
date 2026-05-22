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
  write(path.join(root, 'packs/cmo-skills/mcp/exa/setup.md'), '# Exa Setup\n');
  write(path.join(root, 'packs/cmo-skills/integrations/README.md'), '# CMO Integrations\n');
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
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/C-Vault Guide.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Core Workflows.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills Guide.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Start Here.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Playbooks.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Decision Guide.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Operating Cadence.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Example Outputs.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Command Catalog.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Skill Catalog.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Examples.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/MCP/exa/setup.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Integrations/README.md')));
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

  const guide = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/C-Vault Guide.md'), 'utf8');
  assert.match(guide, /C-Vault - Super Powered Second Brain/);
  assert.match(guide, /Core/);
  assert.match(guide, /CMO Skills/);

  const commandCatalog = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Command Catalog.md'), 'utf8');
  assert.match(commandCatalog, /\/daily-review/);
  assert.match(commandCatalog, /\/cm-research/);

  const skillCatalog = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Skill Catalog.md'), 'utf8');
  assert.match(skillCatalog, /content-strategy/);

  const cmoStartHere = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Start Here.md'), 'utf8');
  assert.match(cmoStartHere, /cm-context/);
  assert.match(cmoStartHere, /research/);
  assert.match(cmoStartHere, /positioning/);

  const cmoPlaybooks = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Playbooks.md'), 'utf8');
  assert.match(cmoPlaybooks, /Launch/);
  assert.match(cmoPlaybooks, /Content Engine/);

  const cmoDecisionGuide = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Decision Guide.md'), 'utf8');
  assert.match(cmoDecisionGuide, /If the user asks/);
  assert.match(cmoDecisionGuide, /Use/);

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
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/C-Vault Guide.md')));
  assert.equal(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills Guide.md')), false);
  assert.equal(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/MCP/exa/setup.md')), false);
  assert.ok(fs.existsSync(path.join(generatedRoot, 'codex-plugin/plugins/c-vault/skills/using-c-vault/SKILL.md')));
  const routing = fs.readFileSync(path.join(generatedRoot, 'claude-code/.claude/skills/using-c-vault/references/routing.md'), 'utf8');
  assert.match(routing, /\/daily-review/);
  assert.doesNotMatch(routing, /\/cm-research/);
  assert.doesNotMatch(routing, /content-strategy/);
});

test('generateAll writes pack-specific docs for cmo-skills only installs', () => {
  const root = makeFixture();
  const generatedRoot = path.join(root, 'generated');
  const result = generateAll({
    packsDir: path.join(root, 'packs'),
    outputDir: generatedRoot,
    packageVersion: '0.1.0',
    packIds: ['cmo-skills'],
  });

  assert.equal(result.packs, 1);
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/C-Vault Guide.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills Guide.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Start Here.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Playbooks.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Decision Guide.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Operating Cadence.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/Example Outputs.md')));
  assert.ok(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/CMO Skills/MCP/exa/setup.md')));
  assert.equal(fs.existsSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Core Workflows.md')), false);

  const guide = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/C-Vault Guide.md'), 'utf8');
  assert.match(guide, /CMO Skills Guide/);
  assert.doesNotMatch(guide, /Core Workflows\.md/);

  const examples = fs.readFileSync(path.join(generatedRoot, 'common/06_Metadata/Reference/Examples.md'), 'utf8');
  assert.match(examples, /CMO Skills Examples/);
  assert.doesNotMatch(examples, /Core Examples/);
  assert.doesNotMatch(examples, /daily-review/);
});
