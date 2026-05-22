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

function extractHeading(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const firstHeading = text.match(/^#\s+(.+)$/m);
  return firstHeading ? firstHeading[1].replace(/^\/?cm:/, 'CM ').replace(/^\/?/, '').trim() : path.basename(filePath, path.extname(filePath));
}

function extractFrontmatterName(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return path.basename(path.dirname(filePath));
  const name = match[1].match(/^name:\s*["']?(.+?)["']?\s*$/m);
  return name ? name[1].trim() : path.basename(path.dirname(filePath));
}

function yamlQuote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function truncateText(value, limit = 120) {
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit - 3).trim()}...` : text;
}

function displayNameFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.toUpperCase() === 'CM' ? 'CM' : part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function skillAgentMetadata(displayName, shortDescription) {
  return [
    'interface:',
    `  display_name: ${yamlQuote(displayName)}`,
    `  short_description: ${yamlQuote(truncateText(shortDescription))}`,
    '',
  ].join('\n');
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
    `This skill wraps the C-Vault /${commandName} command so agents can route to it while the slash command remains available.`,
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

function workflowAgent(command) {
  const commandName = path.basename(command.relativePath, '.md');
  return skillAgentMetadata(extractHeading(command.absolutePath), `Run the /${commandName} C-Vault workflow`);
}

function copiedSkillAgent(skill) {
  const skillName = extractFrontmatterName(skill.absolutePath);
  return skillAgentMetadata(displayNameFromSlug(skillName), extractDescription(skill.absolutePath));
}

const NATURAL_ROUTES = [
  { command: 'weekly-synthesis', triggers: 'weekly review, weekly synthesis, synthesize my week, next week planning', target: 'workflow-weekly-synthesis', action: 'Run /weekly-synthesis.' },
  { command: 'daily-review', triggers: 'daily plan, today review, daily review, plan my day', target: 'workflow-daily-review', action: 'Run /daily-review.' },
  { command: 'inbox-processor', triggers: 'clean inbox note, process inbox, file this note, organize this note', target: 'workflow-inbox-processor', action: 'Run /inbox-processor.' },
  { command: 'thinking-partner', triggers: 'think through this idea, decision help, messy idea, options and tradeoffs', target: 'workflow-thinking-partner', action: 'Run /thinking-partner.' },
  { command: 'de-ai-ify', triggers: 'make this less AI, humanize this, remove AI tone, make writing grounded', target: 'workflow-de-ai-ify', action: 'Run /de-ai-ify.' },
  { command: 'research-assistant', triggers: 'research question, summarize sources, make research note, evidence table', target: 'workflow-research-assistant', action: 'Run /research-assistant.' },
  { command: 'add-frontmatter', triggers: 'add frontmatter, normalize metadata, YAML metadata, note tags', target: 'workflow-add-frontmatter', action: 'Run /add-frontmatter.' },
  { command: 'new-client', triggers: 'new client setup, client workspace, client folder, client README', target: 'workflow-new-client', action: 'Run /new-client.' },
  { command: 'create-command', triggers: 'create command, reusable workflow, agent command, slash command design', target: 'workflow-create-command', action: 'Run /create-command.' },
  { command: 'pragmatic-review', triggers: 'review this plan, practical review, risks and blockers, sanity check', target: 'workflow-pragmatic-review', action: 'Run /pragmatic-review.' },
  { command: 'cm-research', triggers: 'marketing research, ICP, competitors, customer research, market research', target: 'workflow-cm-research', action: 'Run /cm-research.' },
  { command: 'cm-position', triggers: 'positioning, messaging, value proposition, differentiation', target: 'workflow-cm-position', action: 'Run /cm-position when a full workshop is needed, otherwise use positioning.' },
  { command: 'cm-copy', triggers: 'page copy, landing page copy, homepage copy, conversion copy', target: 'workflow-cm-copy', action: 'Run /cm-copy for end-to-end copy, otherwise use copywriting or copy-editing.' },
  { command: 'cm-launch', triggers: 'launch plan, product launch, feature launch, launch checklist', target: 'workflow-cm-launch', action: 'Run /cm-launch.' },
  { command: 'cm-audit', triggers: 'marketing audit, health check, funnel audit, channel audit', target: 'workflow-cm-audit', action: 'Run /cm-audit.' },
  { command: 'cm-sprint', triggers: 'marketing sprint, two week plan, sprint planning, marketing backlog', target: 'workflow-cm-sprint', action: 'Run /cm-sprint.' },
  { command: 'cm-daily', triggers: 'daily marketing review, marketing priorities today, daily marketing check', target: 'workflow-cm-daily', action: 'Run /cm-daily.' },
  { command: 'cm-weekly', triggers: 'weekly marketing review, marketing week recap, marketing patterns', target: 'workflow-cm-weekly', action: 'Run /cm-weekly.' },
  { command: 'cm-standup', triggers: 'marketing standup, async marketing update, blockers today', target: 'workflow-cm-standup', action: 'Run /cm-standup.' },
  { command: 'cm-eod', triggers: 'end of day marketing, EOD wrap, what shipped today', target: 'workflow-cm-eod', action: 'Run /cm-eod.' },
  { command: 'cm-email', triggers: 'email campaign, nurture email, announcement email, lifecycle email', target: 'workflow-cm-email', action: 'Run /cm-email.' },
  { command: 'cm-social', triggers: 'social campaign, social calendar, LinkedIn campaign, Twitter campaign', target: 'workflow-cm-social', action: 'Run /cm-social.' },
  { command: 'cm-retro', triggers: 'campaign retro, launch retro, sprint retro, postmortem', target: 'workflow-cm-retro', action: 'Run /cm-retro.' },
  { command: 'cm-compound', triggers: 'document learnings, capture marketing learning, compound knowledge', target: 'workflow-cm-compound', action: 'Run /cm-compound.' },
  { command: 'cm-setup', triggers: 'setup CMO Skills, bootstrap marketing context, install compounding marketing', target: 'workflow-cm-setup', action: 'Run /cm-setup.' },
  { command: 'cm-uninstall', triggers: 'remove CMO Skills, uninstall compounding marketing, rollback marketing setup', target: 'workflow-cm-uninstall', action: 'Run /cm-uninstall.' },
];

const SPECIALIST_ROUTES = [
  { skill: 'content-strategy', triggers: 'content plan, content calendar, editorial calendar, blog planning', action: 'Use content-strategy.' },
  { skill: 'positioning', triggers: 'single positioning canvas, product positioning, category and alternatives', action: 'Use positioning unless the user wants the full workshop.' },
  { skill: 'copywriting', triggers: 'write new marketing copy, headlines, CTA copy, landing page sections', action: 'Use copywriting.' },
  { skill: 'copy-editing', triggers: 'edit copy, improve copy, polish copy, copy audit', action: 'Use copy-editing.' },
  { skill: 'seo-audit', triggers: 'SEO audit, technical SEO, search performance issues', action: 'Use seo-audit.' },
  { skill: 'ai-seo', triggers: 'AI search, AEO, GEO, ChatGPT search, answer engine optimization', action: 'Use ai-seo.' },
  { skill: 'icp-research', triggers: 'ideal customer profile, ICP, target customer, persona development', action: 'Use icp-research.' },
  { skill: 'competitive-analysis', triggers: 'competitor analysis, competitive landscape, alternatives', action: 'Use competitive-analysis.' },
  { skill: 'gtm-strategy', triggers: 'go to market, GTM motion, sales-led or PLG strategy', action: 'Use gtm-strategy.' },
  { skill: 'channel-strategy', triggers: 'channel selection, acquisition channels, channel mix', action: 'Use channel-strategy.' },
  { skill: 'pricing-strategy', triggers: 'pricing strategy, packaging, tiers, pricing page', action: 'Use pricing-strategy.' },
  { skill: 'email-sequence', triggers: 'email automation, drip campaign, welcome series, nurture sequence', action: 'Use email-sequence.' },
  { skill: 'page-cro', triggers: 'conversion optimization, landing page optimization, CRO audit', action: 'Use page-cro.' },
  { skill: 'paid-ads', triggers: 'paid ads strategy, ad channels, ROAS, CAC', action: 'Use paid-ads.' },
  { skill: 'press-pr', triggers: 'PR, press release, media pitch, announcement', action: 'Use press-pr.' },
  { skill: 'sales-enablement', triggers: 'sales collateral, battle cards, sales materials', action: 'Use sales-enablement.' },
  { skill: 'revops', triggers: 'RevOps, CRM, lead lifecycle, marketing sales handoff', action: 'Use revops.' },
];

function commandNames(packs) {
  return new Set(packs.flatMap((pack) => pack.commands.map((command) => path.basename(command.relativePath, '.md'))));
}

function skillNames(packs) {
  return new Set(packs.flatMap((pack) => pack.skills.map((skill) => extractFrontmatterName(skill.absolutePath))));
}

function packDisplayName(pack) {
  return pack.displayName || pack.name || pack.id;
}

function sortedCommands(packs) {
  return packs.flatMap((pack) => pack.commands.map((command) => ({
    pack,
    name: path.basename(command.relativePath, '.md'),
    description: extractDescription(command.absolutePath),
  }))).sort((left, right) => left.name.localeCompare(right.name));
}

function sortedSkills(packs) {
  return packs.flatMap((pack) => pack.skills.map((skill) => ({
    pack,
    name: extractFrontmatterName(skill.absolutePath),
    description: extractDescription(skill.absolutePath),
  }))).sort((left, right) => left.name.localeCompare(right.name));
}

function cVaultGuide(packs) {
  const hasCore = packs.some((pack) => pack.id === 'core');
  const hasCmo = packs.some((pack) => pack.id === 'cmo-skills');
  const startItems = [];
  if (hasCore) startItems.push('Read `Core Workflows.md` to understand the second-brain operating model.');
  startItems.push('Read `Command Catalog.md` when you know the workflow you want to run.');
  startItems.push('Read `Skill Catalog.md` when you want a specialist capability.');
  startItems.push('Read `Examples.md` for practical prompts and slash-command examples.');
  if (hasCmo) startItems.push('Read `CMO Skills Guide.md` for marketing workflows, MCP notes, and integrations.');

  return [
    '# C-Vault - Super Powered Second Brain',
    '',
    'C-Vault is a modular second-brain setup for Obsidian and agentic tools. It bundles vault structure, daily workflows, reusable commands, specialist skills, and generated adapters for Claude Code, Codex, Cursor, OpenCode, and Obsidian.',
    '',
    '## Installed Packs',
    '',
    ...packs.map((pack) => `- **${packDisplayName(pack)} v${pack.version}** - ${pack.description || 'Installed C-Vault pack.'}`),
    '',
    '## Where to Start',
    '',
    ...startItems.map((item, index) => `${index + 1}. ${item}`),
    '',
    '## Installed Surfaces',
    '',
    '- Claude Code: `.claude/commands`, `.claude/skills`, and `CLAUDE.md`.',
    '- Codex: `.agents/skills`, `AGENTS.md`, and optional Codex plugin skills.',
    '- Cursor: `.cursor/rules` and `AGENTS.md`.',
    '- OpenCode: `.opencode/command` and `AGENTS.md`.',
    '- Obsidian: starter folders, templates, and reference docs under `06_Metadata/Reference`.',
    '',
    '## Safety Model',
    '',
    'C-Vault-managed installs use `.c-vault-install.json` to track generated files and hashes. Updates create missing files, update unchanged tracked files, and skip modified files as conflicts unless you intentionally use `--force`. Use `--dry-run` before installing or updating a real vault.',
    '',
  ].join('\n');
}

function coreWorkflowsGuide(packs) {
  const core = packs.find((pack) => pack.id === 'core');
  if (!core) return null;
  const coreCommands = sortedCommands(packs).filter((entry) => entry.pack.id === 'core');
  const coreInstructions = core ? core.instructionFiles.map((file) => path.basename(file.relativePath, '.md')).sort() : [];
  return [
    '# Core Workflows',
    '',
    'The core pack provides the reusable second-brain layer: folder structure, note templates, agent collaboration rules, and practical workflows for capture, review, research, writing cleanup, and client/project setup.',
    '',
    '## Core Commands',
    '',
    '| Command | Use When |',
    '|---|---|',
    ...coreCommands.map((entry) => `| \`/${entry.name}\` | ${entry.description} |`),
    '',
    '## Core Reference Docs',
    '',
    ...coreInstructions.map((name) => `- ${displayNameFromSlug(name)}`),
    '',
    '## Daily Operating Loop',
    '',
    '1. Capture raw notes in `00_Inbox`.',
    '2. Run `/daily-review` to plan or close the day.',
    '3. Run `/inbox-processor` to move notes to Projects, Areas, Resources, Archive, or Clients.',
    '4. Use `/research-assistant`, `/thinking-partner`, and `/de-ai-ify` for focused work.',
    '5. Run `/weekly-synthesis` to summarize patterns, decisions, and next actions.',
    '',
  ].join('\n');
}

function cmoSkillsGuide(packs) {
  const cmo = packs.find((pack) => pack.id === 'cmo-skills');
  if (!cmo) return null;
  const cmoCommands = sortedCommands(packs).filter((entry) => entry.pack.id === 'cmo-skills');
  const cmoSkills = sortedSkills(packs).filter((entry) => entry.pack.id === 'cmo-skills');
  return [
    '# CMO Skills Guide',
    '',
    `CMO Skills v${cmo.version} adds reusable Compounding Marketing workflows and specialist B2B SaaS marketing skills to C-Vault.`,
    '',
    '## Workflow Commands',
    '',
    '| Command | Use When |',
    '|---|---|',
    ...cmoCommands.map((entry) => `| \`/${entry.name}\` | ${entry.description} |`),
    '',
    '## Specialist Skills',
    '',
    '| Skill | Use When |',
    '|---|---|',
    ...cmoSkills.map((entry) => `| \`${entry.name}\` | ${entry.description} |`),
    '',
    '## Choosing Between Workflows and Skills',
    '',
    '- Use `cm-*` workflow commands when you want a guided, multi-step marketing process.',
    '- Use specialist skills when you need a focused deliverable, such as positioning, ICP research, copywriting, SEO, CRO, pricing, or GTM strategy.',
    '- Use `using-c-vault` when you want the agent to choose the best route from a natural-language request.',
    '',
    '## MCP and Integrations',
    '',
    'If installed, CMO MCP setup notes live under `CMO Skills/MCP`. Integration notes live under `CMO Skills/Integrations`. These docs use placeholder credentials and environment variables only; add real keys in your local tool configuration, not in the vault docs.',
    '',
  ].join('\n');
}

function commandCatalog(packs) {
  return [
    '# Command Catalog',
    '',
    'This catalog lists generated C-Vault slash commands across installed packs.',
    '',
    '| Command | Pack | Description |',
    '|---|---|---|',
    ...sortedCommands(packs).map((entry) => `| \`/${entry.name}\` | ${packDisplayName(entry.pack)} | ${entry.description} |`),
    '',
  ].join('\n');
}

function skillCatalog(packs) {
  return [
    '# Skill Catalog',
    '',
    'This catalog lists installed C-Vault skills. `workflow-*` skills mirror slash commands for natural-language routing; specialist skills provide focused capabilities.',
    '',
    '| Skill | Pack | Description |',
    '|---|---|---|',
    ...sortedSkills(packs).map((entry) => `| \`${entry.name}\` | ${packDisplayName(entry.pack)} | ${entry.description} |`),
    '',
  ].join('\n');
}

function examplesGuide(packs) {
  const commands = commandNames(packs);
  const skills = skillNames(packs);
  const lines = [
    '# C-Vault Examples',
    '',
    'Use these examples as starting points. Direct slash commands are most deterministic. Natural asks route through `using-c-vault` when available.',
    '',
  ];
  if (commands.has('daily-review') || commands.has('weekly-synthesis') || commands.has('inbox-processor')) {
    lines.push('## Core Examples', '');
    if (commands.has('daily-review')) lines.push('- `/daily-review` - Review today, identify open loops, and choose next actions.');
    if (commands.has('weekly-synthesis')) lines.push('- `/weekly-synthesis` - Synthesize the week and prepare next week.');
    if (commands.has('inbox-processor')) lines.push('- `/inbox-processor` - Process an inbox note and decide where it belongs.');
    if (commands.has('thinking-partner')) lines.push('- `/thinking-partner` - Think through a messy idea, decision, or tradeoff.');
    if (commands.has('de-ai-ify')) lines.push('- `/de-ai-ify` - Make writing sound more grounded and human.');
    lines.push('', '## Core Natural Asks', '', '- Synthesize this week\'s notes.', '- Help me think through this product idea.', '- Clean this inbox note and suggest where it belongs.', '- Make this writing sound less AI.', '');
  }
  if (commands.has('cm-research') || skills.has('content-strategy')) {
    lines.push('## CMO Skills Examples', '');
    if (commands.has('cm-research')) lines.push('- `/cm-research` - Research ICPs, competitors, and market context.');
    if (commands.has('cm-position')) lines.push('- `/cm-position` - Run a full positioning workshop.');
    if (skills.has('content-strategy')) lines.push('- `content-strategy` - Build a content plan or editorial calendar.');
    if (skills.has('copywriting')) lines.push('- `copywriting` - Draft landing page, email, or ad copy.');
    lines.push('- Plan content for this product.', '- Research competitors and ICP for this category.', '- Improve this homepage copy for conversion.', '');
  }
  return `${lines.join('\n')}\n`;
}

function writeGeneratedDocs(outputDir, packs) {
  const docsRoot = path.join(outputDir, 'common/06_Metadata/Reference');
  writeFile(path.join(docsRoot, 'C-Vault Guide.md'), cVaultGuide(packs));
  const coreGuide = coreWorkflowsGuide(packs);
  if (coreGuide) {
    writeFile(path.join(docsRoot, 'Core Workflows.md'), coreGuide);
  }
  writeFile(path.join(docsRoot, 'Command Catalog.md'), commandCatalog(packs));
  writeFile(path.join(docsRoot, 'Skill Catalog.md'), skillCatalog(packs));
  writeFile(path.join(docsRoot, 'Examples.md'), examplesGuide(packs));

  const cmoGuide = cmoSkillsGuide(packs);
  if (cmoGuide) {
    writeFile(path.join(docsRoot, 'CMO Skills Guide.md'), cmoGuide);
  }
}

function usingCVaultSkill() {
  return [
    '---',
    'name: using-c-vault',
    'description: Use when C-Vault is tagged or when the user asks for broad second-brain, vault workflow, Obsidian, or CMO marketing help without naming a specific C-Vault skill or command',
    '---',
    '',
    '# Using C-Vault',
    '',
    'C-Vault is a routing layer for second-brain workflows, vault operations, and CMO Skills. Before answering a C-Vault request, choose the smallest matching workflow or specialist skill.',
    '',
    'After selecting a route, invoke or load the matching skill using the current host environment, then follow that skill. In Claude Code, use the Skill tool. In Codex, use the selected installed skill or workflow skill. Do not stop at naming the route.',
    '',
    '## Routing Priority',
    '',
    '1. If the user names a slash command, run that command.',
    '2. If the request matches one workflow clearly, use that `workflow-*` skill.',
    '3. If the request needs a domain deliverable rather than a workflow, use the specialist skill.',
    '4. If two routes are plausible, ask one short clarification.',
    '5. If no route fits, say no C-Vault route matched and ask what kind of help is needed.',
    '',
    '## Reference',
    '',
    'Use `references/routing.md` for deterministic route choices and examples.',
    '',
    '## Guardrails',
    '',
    '- Do not invent vault paths, source files, or private context.',
    '- Ask before writing or restructuring vault content unless the user explicitly requested edits.',
    '- Keep direct slash commands and individual skill requests authoritative.',
    '',
  ].join('\n');
}

function routingReference(packs) {
  const commands = commandNames(packs);
  const skills = skillNames(packs);
  const explicitCommands = packs.flatMap((pack) => pack.commands.map((command) => {
    const name = path.basename(command.relativePath, '.md');
    return { name, description: extractDescription(command.absolutePath) };
  })).sort((left, right) => left.name.localeCompare(right.name));
  const naturalRoutes = NATURAL_ROUTES.filter((route) => commands.has(route.command));
  const specialistRoutes = SPECIALIST_ROUTES.filter((route) => skills.has(route.skill));

  return [
    '# C-Vault Routing Reference',
    '',
    'Use this reference after loading `using-c-vault`.',
    '',
    '## Decision Rules',
    '',
    '1. Explicit slash commands win over natural-language inference.',
    '2. Workflows handle multi-step process. Specialist skills handle focused domain deliverables.',
    '3. If two routes are plausible, ask one short clarification.',
    '4. If no route matches, state that no C-Vault route matched and ask what kind of help is needed.',
    '',
    '## Explicit Commands',
    '',
    '| User names | Route |',
    '|---|---|',
    ...explicitCommands.map((command) => `| \`/${command.name}\` | Run \`/${command.name}\`. ${command.description} |`),
    '',
    '## Natural-Language Workflow Routes',
    '',
    '| User intent | Route | Action |',
    '|---|---|---|',
    ...naturalRoutes.map((route) => `| ${route.triggers} | \`${route.target}\` | ${route.action} |`),
    '',
    '## Specialist Skill Routes',
    '',
    '| User intent | Route | Action |',
    '|---|---|---|',
    ...specialistRoutes.map((route) => `| ${route.triggers} | \`${route.skill}\` | ${route.action} |`),
    '',
    '## Ambiguity Handling',
    '',
    '- Content strategy vs. marketing research: ask whether they need research foundation or an editorial calendar.',
    '- Positioning workflow vs. positioning skill: ask whether they want the full workshop or just a positioning canvas.',
    '- Copy workflow vs. copywriting skill: ask whether they want end-to-end research-to-CRO or only draft copy.',
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
      writeFile(path.join(outputDir, 'claude-code/.claude/skills', `workflow-${commandName}`, 'SKILL.md'), workflowSkill(command, pack.name));
      writeFile(path.join(outputDir, 'codex/.agents/skills', `workflow-${commandName}`, 'SKILL.md'), workflowSkill(command, pack.name));
      writeFile(path.join(outputDir, 'codex/.agents/skills', `workflow-${commandName}`, 'agents/openai.yaml'), workflowAgent(command));
      writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/skills', `workflow-${commandName}`, 'SKILL.md'), workflowSkill(command, pack.name));
      writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/skills', `workflow-${commandName}`, 'agents/openai.yaml'), workflowAgent(command));
    }

    for (const skill of pack.skills) {
      const skillName = path.dirname(skill.relativePath);
      const skillSourceDir = path.dirname(skill.absolutePath);
      copyTree(skillSourceDir, path.join(outputDir, 'claude-code/.claude/skills', skillName));
      copyTree(skillSourceDir, path.join(outputDir, 'codex/.agents/skills', skillName));
      writeFile(path.join(outputDir, 'codex/.agents/skills', skillName, 'agents/openai.yaml'), copiedSkillAgent(skill));
      copyTree(skillSourceDir, path.join(outputDir, 'codex-plugin/plugins/c-vault/skills', skillName));
      writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/skills', skillName, 'agents/openai.yaml'), copiedSkillAgent(skill));
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

    if (pack.id === 'cmo-skills') {
      for (const mcpFile of pack.mcpFiles) {
        copyFile(mcpFile.absolutePath, path.join(outputDir, 'common/06_Metadata/Reference/CMO Skills/MCP', mcpFile.relativePath));
      }
      for (const integrationFile of pack.integrationFiles) {
        copyFile(integrationFile.absolutePath, path.join(outputDir, 'common/06_Metadata/Reference/CMO Skills/Integrations', integrationFile.relativePath));
      }
    }
  }

  writeGeneratedDocs(outputDir, packs);

  writeFile(path.join(outputDir, 'common/AGENTS.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'common/CLAUDE.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'claude-code/CLAUDE.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'codex/AGENTS.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'cursor/AGENTS.md'), commonInstructions(packs));
  writeFile(path.join(outputDir, 'opencode/AGENTS.md'), commonInstructions(packs));

  writeFile(path.join(outputDir, 'claude-code/.claude/skills/using-c-vault/SKILL.md'), usingCVaultSkill());
  writeFile(path.join(outputDir, 'claude-code/.claude/skills/using-c-vault/references/routing.md'), routingReference(packs));
  writeFile(path.join(outputDir, 'codex/.agents/skills/using-c-vault/SKILL.md'), usingCVaultSkill());
  writeFile(path.join(outputDir, 'codex/.agents/skills/using-c-vault/references/routing.md'), routingReference(packs));
  writeFile(path.join(outputDir, 'codex/.agents/skills/using-c-vault/agents/openai.yaml'), skillAgentMetadata('Using C-Vault', 'Select the right C-Vault workflow or CMO skill'));
  writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/skills/using-c-vault/SKILL.md'), usingCVaultSkill());
  writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/skills/using-c-vault/references/routing.md'), routingReference(packs));
  writeFile(path.join(outputDir, 'codex-plugin/plugins/c-vault/skills/using-c-vault/agents/openai.yaml'), skillAgentMetadata('Using C-Vault', 'Select the right C-Vault workflow or CMO skill'));

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
        'Help me choose the right C-Vault workflow.',
        'Synthesize this week\'s notes.',
        'Plan content for this product.',
        'Make this writing sound less AI.',
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
