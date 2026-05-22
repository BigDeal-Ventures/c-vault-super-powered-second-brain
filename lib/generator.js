const fs = require('node:fs');
const path = require('node:path');
const { copyFile, copyTree, ensureDir, removeDir, writeFile } = require('./fs-utils');
const { loadPacks } = require('./pack-loader');

function extractDescription(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    const description = match[1].match(/^description:\s*["']?(.+?)["']?\s*$/m);
    if (description) return description[1].trim();
  }
  const firstHeading = text.match(/^#\s+(.+)$/m);
  return firstHeading ? firstHeading[1].trim() : `Run ${path.basename(filePath, '.md')}.`;
}

function codexShim(command, packName) {
  const commandName = path.basename(command.relativePath, '.md');
  const description = extractDescription(command.absolutePath).replaceAll('"', '\\"');
  const source = fs.readFileSync(command.absolutePath, 'utf8');
  return [
    '---',
    `description: "${description}"`,
    '---',
    '',
    `# /${commandName}`,
    '',
    'This is a generated C-Vault command shim.',
    '',
    `Canonical source: pack: ${packName}, command: ${command.relativePath}`,
    '',
    'Execution steps:',
    '',
    '1. Follow the embedded canonical workflow below exactly.',
    '2. Resolve vault paths relative to the current workspace or configured vault root.',
    '3. Stop and ask if required context is missing.',
    '',
    '---',
    '',
    '## Embedded Canonical Workflow',
    '',
    source,
    '',
  ].join('\n');
}

function workflowSkill(command, packName) {
  const commandName = path.basename(command.relativePath, '.md');
  const skillName = `workflow-${commandName}`;
  const description = extractDescription(command.absolutePath).replaceAll('"', '\\"');
  const source = fs.readFileSync(command.absolutePath, 'utf8');
  return [
    '---',
    `name: ${skillName}`,
    `description: Use when the user asks to run the /${commandName} C-Vault workflow from the ${packName} pack. ${description}`,
    '---',
    '',
    `# ${skillName}`,
    '',
    `This skill wraps the C-Vault /${commandName} command so it can be enabled or disabled from plugin skill settings.`,
    '',
    'Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.',
    '',
    '---',
    '',
    '## Embedded Workflow',
    '',
    source,
    '',
  ].join('\n');
}

function cursorRule(command, packName) {
  const commandName = path.basename(command.relativePath, '.md');
  const source = fs.readFileSync(command.absolutePath, 'utf8');
  return [
    '---',
    `description: ${extractDescription(command.absolutePath)}`,
    'alwaysApply: false',
    '---',
    '',
    `# ${commandName}`,
    '',
    `Generated from C-Vault pack ${packName}.`,
    '',
    source,
  ].join('\n');
}

function commonInstructions(packs) {
  return [
    '# C-Vault Installed Context',
    '',
    'This workspace has C-Vault installed.',
    '',
    'Use the installed packs as the source of truth for workflows, skills, templates, and vault conventions.',
    '',
    'Installed packs:',
    ...packs.map((pack) => `- ${pack.name} v${pack.version}: ${pack.description || pack.displayName || pack.name}`),
    '',
  ].join('\n');
}

function generateAll(options = {}) {
  const repoRoot = options.repoRoot || path.resolve(__dirname, '..');
  const packsDir = options.packsDir || path.join(repoRoot, 'packs');
  const outputDir = options.outputDir || path.join(repoRoot, 'generated');
  const packageVersion = options.packageVersion || require(path.join(repoRoot, 'package.json')).version;
  let packs = loadPacks(packsDir);
  if (options.packIds && options.packIds.length > 0) {
    const selected = new Set(options.packIds);
    packs = packs.filter((pack) => selected.has(pack.id || pack.name));
  }

  removeDir(outputDir);
  ensureDir(outputDir);

  for (const pack of packs) {
    for (const command of pack.commands) {
      copyFile(command.absolutePath, path.join(outputDir, 'claude-code/.claude/commands', command.relativePath));
      copyFile(command.absolutePath, path.join(outputDir, 'opencode/.opencode/command', command.relativePath));
      writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/commands', command.relativePath), codexShim(command, pack.name));
      writeFile(path.join(outputDir, 'cursor/.cursor/rules', command.relativePath.replace(/\.md$/, '.mdc')), cursorRule(command, pack.name));
      const commandName = path.basename(command.relativePath, '.md');
      writeFile(path.join(outputDir, 'codex/.agents/skills', `workflow-${commandName}`, 'SKILL.md'), workflowSkill(command, pack.name));
      writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/skills', `workflow-${commandName}`, 'SKILL.md'), workflowSkill(command, pack.name));
    }

    for (const skill of pack.skills) {
      const skillName = path.dirname(skill.relativePath);
      const skillSourceDir = path.dirname(skill.absolutePath);
      copyTree(skillSourceDir, path.join(outputDir, 'claude-code/.claude/skills', skillName));
      copyTree(skillSourceDir, path.join(outputDir, 'codex/.agents/skills', skillName));
      copyTree(skillSourceDir, path.join(outputDir, 'codex-plugin/plugins/c-vault/skills', skillName));
    }

    for (const template of pack.templates) {
      copyFile(template.absolutePath, path.join(outputDir, 'obsidian/06_Metadata/Templates', template.relativePath));
    }

    for (const obsidianFile of pack.obsidianFiles) {
      copyFile(obsidianFile.absolutePath, path.join(outputDir, 'obsidian', obsidianFile.relativePath));
    }

    for (const instruction of pack.instructionFiles) {
      copyFile(instruction.absolutePath, path.join(outputDir, 'common/06_Metadata/Reference', instruction.relativePath));
    }
  }

  writeFile(path.join(outputDir, 'common/AGENTS.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'common/CLAUDE.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'claude-code/CLAUDE.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'codex/AGENTS.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'cursor/AGENTS.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'opencode/AGENTS.md'), commonInstructions(packs));

  const codexPlugin = {
    name: 'c-vault',
    version: packageVersion,
    description: 'C-Vault workflows and skills for Codex.',
    skills: './skills/',
    author: { name: 'Chinmaya Shankar', url: 'https://bigdeal.ventures' },
    license: 'MIT',
    interface: {
      displayName: 'C-Vault',
      shortDescription: 'Super powered second brain workflows for Codex',
      longDescription: 'C-Vault brings second-brain workflows, Obsidian vault conventions, and CMO Skills into Codex through generated commands and skills. Use it for daily review, weekly synthesis, research, inbox processing, writing cleanup, and B2B SaaS marketing workflows.',
      developerName: 'Chinmaya Shankar',
      category: 'Productivity',
      capabilities: ['Read', 'Write', 'Interactive'],
      defaultPrompt: [
        'Run /thinking-partner for this new project.',
        'Run /weekly-synthesis for this vault.',
        'Run /cm-research for this product.',
      ],
    },
  };
  writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/.codex-plugin/plugin.json'), `${JSON.stringify(codexPlugin, null, 2)}\n`);
  writeFile(path.join(outputDir, 'codex-plugin/.agents/plugins/marketplace.json'), `${JSON.stringify({
    name: 'c-vault',
    interface: { displayName: 'C-Vault' },
    plugins: [{
      name: 'c-vault',
      source: { source: 'local', path: './plugins/c-vault' },
      policy: { installation: 'AVAILABLE', authentication: 'ON_USE' },
      category: 'Productivity',
    }],
  }, null, 2)}\n`);

  writeFile(path.join(repoRoot, '.agents/plugins/marketplace.json'), `${JSON.stringify({
    name: 'c-vault',
    interface: { displayName: 'C-Vault' },
    plugins: [{
      name: 'c-vault',
      source: { source: 'local', path: './generated/codex-plugin/plugins/c-vault' },
      policy: { installation: 'AVAILABLE', authentication: 'ON_USE' },
      category: 'Productivity',
    }],
  }, null, 2)}\n`);

  writeFile(path.join(outputDir, 'claude-desktop/README.md'), [
    '# Claude Desktop',
    '',
    'Use C-Vault through generated prompts/resources or install the project outputs into a Claude-accessible vault.',
    'A full MCPB package can be layered on this generated directory in a later release.',
    '',
  ].join('\n'));

  return { packs: packs.length, outputDir };
}

module.exports = { generateAll };
