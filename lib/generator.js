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
  if (hasCore) startItems.push('Read [Core Workflows](Core Workflows.md) to understand the second-brain operating model.');
  startItems.push('Read [Command Catalog](Command Catalog.md) when you know the workflow you want to run.');
  startItems.push('Read [Skill Catalog](Skill Catalog.md) when you want a specialist capability.');
  startItems.push('Read [Examples](Examples.md) for practical prompts and slash-command examples.');
  if (hasCmo) startItems.push('Read [CMO Skills Guide](CMO Skills Guide.md) for the overview, then [Start Here](CMO Skills/Start Here.md), [Decision Guide](CMO Skills/Decision Guide.md), and [Playbooks](CMO Skills/Playbooks.md) for real work.');

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
    ...coreInstructions.map((name) => `- [${displayNameFromSlug(name)}](${name}.md)`),
    '',
    '## Daily Operating Loop',
    '',
    '1. Capture raw notes in `00_Inbox`.',
    '2. Run `/daily-review` to plan or close the day.',
    '3. Run `/inbox-processor` to move notes to Projects, Areas, Resources, Archive, or Clients.',
    '4. Use `/research-assistant`, `/thinking-partner`, and `/de-ai-ify` for focused work.',
    '5. Run `/weekly-synthesis` to summarize patterns, decisions, and next actions.',
    '',
    '## Related Docs',
    '',
    '- [C-Vault Guide](C-Vault Guide.md)',
    '- [Command Catalog](Command Catalog.md)',
    '- [Skill Catalog](Skill Catalog.md)',
    '- [Examples](Examples.md)',
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
    '## Handbook',
    '',
    '- [Start Here](CMO Skills/Start Here.md) - recommended setup and first workflow path.',
    '- [Playbooks](CMO Skills/Playbooks.md) - scenario-based playbooks for launch, positioning, content, SEO/AEO, CRO, lifecycle, paid, and RevOps.',
    '- [Decision Guide](CMO Skills/Decision Guide.md) - which command or skill to use by user intent.',
    '- [Operating Cadence](CMO Skills/Operating Cadence.md) - daily, weekly, sprint, monthly, and quarterly marketing rhythms.',
    '- [Example Outputs](CMO Skills/Example Outputs.md) - examples of useful deliverables and output shapes.',
    '',
    '## MCP and Integrations',
    '',
    'If installed, CMO MCP setup notes live under [MCP](CMO Skills/MCP/README.md). Integration notes live under [Integrations](CMO Skills/Integrations/README.md). These docs use placeholder credentials and environment variables only; add real keys in your local tool configuration, not in the vault docs.',
    '',
    '## Related Docs',
    '',
    '- [C-Vault Guide](C-Vault Guide.md)',
    '- [Command Catalog](Command Catalog.md)',
    '- [Skill Catalog](Skill Catalog.md)',
    '- [Examples](Examples.md)',
    '',
  ].join('\n');
}

function cmoStartHereGuide() {
  return [
    '# CMO Skills Start Here',
    '',
    'Use this guide when you are new to CMO Skills or when starting marketing work in a fresh project.',
    '',
    '## Recommended Setup Sequence',
    '',
    '1. Run `cm-context` or `/cm-setup` to create the product-marketing foundation.',
    '2. Run `/cm-research` or `icp-research` to understand customers, competitors, switching triggers, and buying criteria.',
    '3. Run `/cm-position` or `positioning` to define alternatives, differentiation, category, and best-fit customers.',
    '4. Use `messaging-framework` and `value-proposition` to turn positioning into reusable messages.',
    '5. Use `content-strategy`, `copywriting`, `seo-audit`, `ai-seo`, `page-cro`, or lifecycle skills depending on the next growth bottleneck.',
    '6. Run `/cm-compound` after major work to capture learnings back into the vault.',
    '',
    '## First Questions to Answer',
    '',
    '- What product, market, and customer segment is this for?',
    '- What is the current bottleneck: understanding, positioning, traffic, conversion, activation, retention, or revenue operations?',
    '- Is the user asking for a guided workflow or one focused deliverable?',
    '- What existing evidence is available: customer calls, analytics, competitors, website copy, search data, sales notes, or CRM notes?',
    '',
    '## Fast Paths',
    '',
    '| Situation | Start With | Then Use |',
    '|---|---|---|',
    '| New product or vague strategy | `/cm-research` | `/cm-position`, `messaging-framework`, `content-strategy` |',
    '| Need homepage or landing page copy | `/cm-copy` | `copywriting`, `copy-editing`, `page-cro` |',
    '| Need a content engine | `content-strategy` | `ai-seo`, `seo-audit`, `programmatic-seo`, `social-content` |',
    '| Need launch planning | `/cm-launch` | `launch-strategy`, `press-pr`, `product-hunt-launch`, `/cm-social` |',
    '| Need funnel improvement | `/cm-audit` | `page-cro`, `signup-flow-cro`, `onboarding-cro`, `pricing-strategy` |',
    '| Need operating rhythm | `/cm-sprint` | `/cm-daily`, `/cm-weekly`, `/cm-retro`, `/cm-compound` |',
    '',
    '## Related Docs',
    '',
    '- [Playbooks](Playbooks.md)',
    '- [Decision Guide](Decision Guide.md)',
    '- [Operating Cadence](Operating Cadence.md)',
    '- [Example Outputs](Example Outputs.md)',
    '- [CMO Skills Guide](../CMO Skills Guide.md)',
    '',
  ].join('\n');
}

function cmoPlaybooksGuide() {
  return [
    '# CMO Skills Playbooks',
    '',
    'Use these playbooks when the user describes a marketing goal instead of naming a command or skill.',
    '',
    '## Launch',
    '',
    'Goal: turn a product, feature, or announcement into a coordinated launch.',
    '',
    '1. Run `/cm-research` if the market, ICP, or category is unclear.',
    '2. Run `/cm-position` to sharpen narrative, differentiation, and audience.',
    '3. Use `/cm-launch` for timeline, channels, assets, owners, and launch-day execution.',
    '4. Use `/cm-email`, `/cm-social`, `press-pr`, and `product-hunt-launch` for channel-specific execution.',
    '5. Run `/cm-retro` and `/cm-compound` after launch.',
    '',
    '## Positioning and Messaging',
    '',
    'Goal: make the product easier to understand, compare, and buy.',
    '',
    '1. Use `customer-research`, `icp-research`, and `competitive-analysis` to collect inputs.',
    '2. Run `/cm-position` for the full workshop or `positioning` for a focused canvas.',
    '3. Use `messaging-framework` and `value-proposition` to turn strategy into reusable claims.',
    '4. Use `copywriting` or `/cm-copy` to apply the message to pages, email, or ads.',
    '',
    '## Content Engine',
    '',
    'Goal: build repeatable demand creation and demand capture.',
    '',
    '1. Use `content-strategy` for themes, journey mapping, formats, and calendar.',
    '2. Use `seo-audit`, `ai-seo`, `site-architecture`, and `programmatic-seo` for search and answer-engine coverage.',
    '3. Use `social-content`, `social-media-strategy`, `newsletter-growth`, and `lead-magnets` for distribution.',
    '4. Use `content-performance-scoring` and `/cm-weekly` to review what is working.',
    '',
    '## SEO and AEO',
    '',
    'Goal: improve search visibility across Google, AI search, and high-intent comparison queries.',
    '',
    '1. Use `seo-audit` to find technical and content gaps.',
    '2. Use `ai-seo` for answer-engine visibility and citation-ready content.',
    '3. Use `competitor-alternatives`, `competitive-analysis`, and `programmatic-seo` for BOFU and scaled pages.',
    '4. Use `schema-markup` and `site-architecture` to improve machine readability.',
    '',
    '## CRO and Funnel Improvement',
    '',
    'Goal: improve conversion from visitor to lead, signup, activation, or paid account.',
    '',
    '1. Run `/cm-audit` to identify the biggest funnel constraints.',
    '2. Use `page-cro`, `form-cro`, `signup-flow-cro`, `onboarding-cro`, `paywall-upgrade-cro`, or `popup-cro` for the relevant surface.',
    '3. Use `ab-test-setup` to define hypotheses and decision criteria.',
    '4. Use `analytics-tracking` and `attribution-modeling` to measure outcomes.',
    '',
    '## Lifecycle and Revenue',
    '',
    'Goal: improve nurture, activation, expansion, retention, and sales handoff.',
    '',
    '1. Use `email-sequence`, `marketing-automation`, and `email-deliverability` for lifecycle campaigns.',
    '2. Use `churn-prevention`, `referral-program`, and `community-strategy` for retention and advocacy.',
    '3. Use `sales-enablement`, `revops`, and `pricing-strategy` for sales and revenue operations.',
    '4. Use `/cm-weekly` and `/cm-retro` to compound learnings.',
    '',
    '## Paid and ABM',
    '',
    'Goal: create focused acquisition campaigns with clear targeting and economics.',
    '',
    '1. Use `icp-research`, `channel-strategy`, and `market-sizing` before budget decisions.',
    '2. Use `paid-ads`, `linkedin-ads`, `ad-creative`, and `abm-strategy` for campaign planning.',
    '3. Use `landing page copy` through `/cm-copy`, `copywriting`, and `page-cro`.',
    '4. Use `attribution-modeling` to understand pipeline impact.',
    '',
    '## Related Docs',
    '',
    '- [Start Here](Start Here.md)',
    '- [Decision Guide](Decision Guide.md)',
    '- [Operating Cadence](Operating Cadence.md)',
    '- [Example Outputs](Example Outputs.md)',
    '- [CMO Skills Guide](../CMO Skills Guide.md)',
    '',
  ].join('\n');
}

function cmoDecisionGuide() {
  return [
    '# CMO Skills Decision Guide',
    '',
    'Use this when deciding which CMO workflow or specialist skill should handle a request.',
    '',
    '| If the user asks... | Use | Why |',
    '|---|---|---|',
    '| "I need to understand this market / ICP / competitors" | `/cm-research`, `icp-research`, `competitive-analysis` | Research workflows gather evidence before strategy. |',
    '| "Help position this product" | `/cm-position` or `positioning` | Use `/cm-position` for a full workshop; use `positioning` for a focused canvas. |',
    '| "Build messaging or value props" | `messaging-framework`, `value-proposition` | These turn positioning into reusable claims and proof points. |',
    '| "Plan content or editorial calendar" | `content-strategy` | This maps topics, formats, funnel stage, and distribution. |',
    '| "Write homepage / landing page / email / ad copy" | `/cm-copy`, `copywriting`, `copy-editing` | Use `/cm-copy` for end-to-end copy; use specialist skills for drafting or polishing. |',
    '| "Improve SEO or AI search" | `seo-audit`, `ai-seo`, `site-architecture`, `schema-markup` | These cover search, answer engines, structure, and machine readability. |',
    '| "Improve conversions" | `/cm-audit`, `page-cro`, `form-cro`, `signup-flow-cro`, `onboarding-cro` | Start broad with audit, then specialize by funnel surface. |',
    '| "Plan a launch" | `/cm-launch`, `launch-strategy`, `press-pr`, `product-hunt-launch` | These handle launch narrative, timeline, channels, and promotion. |',
    '| "Set up email or lifecycle campaigns" | `/cm-email`, `email-sequence`, `marketing-automation`, `email-deliverability` | These cover campaign structure, automation, and inbox placement. |',
    '| "Run a marketing sprint or cadence" | `/cm-sprint`, `/cm-daily`, `/cm-weekly`, `/cm-standup`, `/cm-eod` | These manage marketing operations and rhythm. |',
    '| "Capture what we learned" | `/cm-compound` | This turns work into reusable marketing knowledge. |',
    '| "Set up or remove CMO Skills" | `/cm-setup`, `/cm-uninstall` | These handle project bootstrap or rollback. |',
    '',
    '## Clarify When Needed',
    '',
    '- Research vs content plan: ask whether they need evidence or an editorial calendar.',
    '- Positioning workflow vs skill: ask whether they want the full workshop or a focused positioning canvas.',
    '- Copy workflow vs copywriting skill: ask whether they want research-to-CRO or only draft copy.',
    '- Audit vs CRO skill: ask whether they want a broad funnel review or one surface improved.',
    '',
    '## Related Docs',
    '',
    '- [Start Here](Start Here.md)',
    '- [Playbooks](Playbooks.md)',
    '- [Operating Cadence](Operating Cadence.md)',
    '- [Example Outputs](Example Outputs.md)',
    '- [CMO Skills Guide](../CMO Skills Guide.md)',
    '',
  ].join('\n');
}

function cmoOperatingCadence() {
  return [
    '# CMO Skills Operating Cadence',
    '',
    'Use this cadence to make CMO Skills work as an ongoing marketing operating system, not just one-off prompts.',
    '',
    '## Daily',
    '',
    '- Run `/cm-daily` to choose the day\'s marketing priorities.',
    '- Run `/cm-standup` when coordinating with a team or client.',
    '- Run `/cm-eod` to capture shipped work, blockers, and follow-ups.',
    '',
    '## Weekly',
    '',
    '- Run `/cm-weekly` to review performance, patterns, campaigns, and next actions.',
    '- Use `content-performance-scoring`, `analytics-tracking`, or `attribution-modeling` when reviewing live assets.',
    '- Run `/cm-compound` to document learnings that should influence future marketing.',
    '',
    '## Sprint',
    '',
    '- Run `/cm-sprint` to choose a two-week marketing backlog.',
    '- Use `/cm-audit` at the start when the bottleneck is unclear.',
    '- Use `/cm-retro` at the end to separate signal from noise.',
    '',
    '## Monthly',
    '',
    '- Revisit `icp-research`, `competitive-analysis`, and `channel-strategy` if market assumptions changed.',
    '- Review content, SEO/AEO, paid, lifecycle, and CRO performance.',
    '- Update positioning and messaging if customer language or competitive alternatives changed.',
    '',
    '## Quarterly',
    '',
    '- Re-run market, ICP, positioning, pricing, and channel assumptions.',
    '- Review which campaigns created durable knowledge, not just activity.',
    '- Update the product-marketing context before starting the next cycle.',
    '',
    '## Related Docs',
    '',
    '- [Start Here](Start Here.md)',
    '- [Playbooks](Playbooks.md)',
    '- [Decision Guide](Decision Guide.md)',
    '- [Example Outputs](Example Outputs.md)',
    '- [CMO Skills Guide](../CMO Skills Guide.md)',
    '',
  ].join('\n');
}

function cmoExampleOutputs() {
  return [
    '# CMO Skills Example Outputs',
    '',
    'These are output shapes to request or expect from CMO Skills. They are intentionally compact so they can be copied into notes, briefs, and working docs.',
    '',
    '## Research Brief',
    '',
    '- Market definition',
    '- ICP segments and disqualifiers',
    '- Customer pains, desired outcomes, and switching triggers',
    '- Competitors and alternatives',
    '- Messaging implications',
    '- Open questions and evidence gaps',
    '',
    '## Positioning Canvas',
    '',
    '- Competitive alternatives',
    '- Unique attributes',
    '- Value delivered',
    '- Best-fit customers',
    '- Market category',
    '- Proof points and risks',
    '',
    '## Content Strategy',
    '',
    '- Audience and funnel stage',
    '- Themes and topic clusters',
    '- BOFU comparison and alternative opportunities',
    '- Distribution channels',
    '- Editorial calendar',
    '- Measurement plan',
    '',
    '## Landing Page Copy Brief',
    '',
    '- Page goal',
    '- Primary audience',
    '- Core promise',
    '- Objections and proof',
    '- Section-by-section copy outline',
    '- CTA and conversion risks',
    '',
    '## Launch Plan',
    '',
    '- Launch narrative',
    '- Audience and segmentation',
    '- Timeline',
    '- Channel plan',
    '- Asset checklist',
    '- Launch-day runbook',
    '- Post-launch retro questions',
    '',
    '## CRO Audit',
    '',
    '- Conversion goal',
    '- Friction points',
    '- Message clarity issues',
    '- Trust gaps',
    '- Experiment ideas',
    '- Priority fixes by impact and effort',
    '',
    '## Weekly Marketing Review',
    '',
    '- What shipped',
    '- What moved metrics',
    '- What did not work',
    '- Learnings to compound',
    '- Next week priorities',
    '- Decisions needed',
    '',
    '## Related Docs',
    '',
    '- [Start Here](Start Here.md)',
    '- [Playbooks](Playbooks.md)',
    '- [Decision Guide](Decision Guide.md)',
    '- [Operating Cadence](Operating Cadence.md)',
    '- [CMO Skills Guide](../CMO Skills Guide.md)',
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
    '## Related Docs',
    '',
    '- [C-Vault Guide](C-Vault Guide.md)',
    '- [Skill Catalog](Skill Catalog.md)',
    '- [Examples](Examples.md)',
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
    '## Related Docs',
    '',
    '- [C-Vault Guide](C-Vault Guide.md)',
    '- [Command Catalog](Command Catalog.md)',
    '- [Examples](Examples.md)',
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
  lines.push('## Related Docs', '', '- [C-Vault Guide](C-Vault Guide.md)', '- [Command Catalog](Command Catalog.md)', '- [Skill Catalog](Skill Catalog.md)');
  if (commands.has('daily-review') || commands.has('weekly-synthesis')) lines.push('- [Core Workflows](Core Workflows.md)');
  if (commands.has('cm-research') || skills.has('content-strategy')) lines.push('- [CMO Skills Guide](CMO Skills Guide.md)', '- [CMO Skills Start Here](CMO Skills/Start Here.md)');
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
    writeFile(path.join(docsRoot, 'CMO Skills/Start Here.md'), cmoStartHereGuide());
    writeFile(path.join(docsRoot, 'CMO Skills/Playbooks.md'), cmoPlaybooksGuide());
    writeFile(path.join(docsRoot, 'CMO Skills/Decision Guide.md'), cmoDecisionGuide());
    writeFile(path.join(docsRoot, 'CMO Skills/Operating Cadence.md'), cmoOperatingCadence());
    writeFile(path.join(docsRoot, 'CMO Skills/Example Outputs.md'), cmoExampleOutputs());
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
