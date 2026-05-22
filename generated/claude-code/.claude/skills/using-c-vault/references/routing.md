# C-Vault Routing Reference

Use this reference after loading `using-c-vault`.

## Decision Rules

1. Explicit slash commands win over natural-language inference.
2. Workflows handle multi-step process. Specialist skills handle focused domain deliverables.
3. If two routes are plausible, ask one short clarification.
4. If no route matches, state that no C-Vault route matched and ask what kind of help is needed.

## Explicit Commands

| User names | Route |
|---|---|
| `/add-frontmatter` | Run `/add-frontmatter`. Add Frontmatter |
| `/cm-audit` | Run `/cm-audit`. /cm:audit — Marketing Audit |
| `/cm-compound` | Run `/cm-compound`. /cm:compound — Document Learnings |
| `/cm-copy` | Run `/cm-copy`. /cm:copy — End-to-End Copywriting Workflow |
| `/cm-daily` | Run `/cm-daily`. /cm:daily — Daily Marketing Review |
| `/cm-email` | Run `/cm-email`. /cm:email — Email Campaign Setup End-to-End |
| `/cm-eod` | Run `/cm-eod`. /cm:eod — End of Day Marketing Wrap |
| `/cm-launch` | Run `/cm-launch`. /cm:launch — Launch Planning & Execution |
| `/cm-position` | Run `/cm-position`. /cm:position — Full Positioning Workshop |
| `/cm-research` | Run `/cm-research`. /cm:research — Deep Market Research Workflow |
| `/cm-retro` | Run `/cm-retro`. /cm:retro — Campaign / Sprint Retrospective |
| `/cm-setup` | Run `/cm-setup`. /cm-setup — Per-Project Bootstrap |
| `/cm-social` | Run `/cm-social`. /cm:social — Social Media Campaign Planning |
| `/cm-sprint` | Run `/cm-sprint`. /cm:sprint — Marketing Sprint Planning |
| `/cm-standup` | Run `/cm-standup`. /cm:standup — Marketing Standup |
| `/cm-uninstall` | Run `/cm-uninstall`. /cm-uninstall — Reverse a Compounding Marketing install |
| `/cm-weekly` | Run `/cm-weekly`. /cm:weekly — Weekly Marketing Review |
| `/create-command` | Run `/create-command`. Create Command |
| `/daily-review` | Run `/daily-review`. Daily Review |
| `/de-ai-ify` | Run `/de-ai-ify`. De-AI-ify |
| `/inbox-processor` | Run `/inbox-processor`. Inbox Processor |
| `/new-client` | Run `/new-client`. New Client |
| `/pragmatic-review` | Run `/pragmatic-review`. Pragmatic Review |
| `/research-assistant` | Run `/research-assistant`. Research Assistant |
| `/thinking-partner` | Run `/thinking-partner`. Thinking Partner |
| `/weekly-synthesis` | Run `/weekly-synthesis`. Weekly Synthesis |

## Natural-Language Workflow Routes

| User intent | Route | Action |
|---|---|---|
| weekly review, weekly synthesis, synthesize my week, next week planning | `workflow-weekly-synthesis` | Run /weekly-synthesis. |
| daily plan, today review, daily review, plan my day | `workflow-daily-review` | Run /daily-review. |
| clean inbox note, process inbox, file this note, organize this note | `workflow-inbox-processor` | Run /inbox-processor. |
| think through this idea, decision help, messy idea, options and tradeoffs | `workflow-thinking-partner` | Run /thinking-partner. |
| make this less AI, humanize this, remove AI tone, make writing grounded | `workflow-de-ai-ify` | Run /de-ai-ify. |
| research question, summarize sources, make research note, evidence table | `workflow-research-assistant` | Run /research-assistant. |
| add frontmatter, normalize metadata, YAML metadata, note tags | `workflow-add-frontmatter` | Run /add-frontmatter. |
| new client setup, client workspace, client folder, client README | `workflow-new-client` | Run /new-client. |
| create command, reusable workflow, agent command, slash command design | `workflow-create-command` | Run /create-command. |
| review this plan, practical review, risks and blockers, sanity check | `workflow-pragmatic-review` | Run /pragmatic-review. |
| marketing research, ICP, competitors, customer research, market research | `workflow-cm-research` | Run /cm-research. |
| positioning, messaging, value proposition, differentiation | `workflow-cm-position` | Run /cm-position when a full workshop is needed, otherwise use positioning. |
| page copy, landing page copy, homepage copy, conversion copy | `workflow-cm-copy` | Run /cm-copy for end-to-end copy, otherwise use copywriting or copy-editing. |
| launch plan, product launch, feature launch, launch checklist | `workflow-cm-launch` | Run /cm-launch. |
| marketing audit, health check, funnel audit, channel audit | `workflow-cm-audit` | Run /cm-audit. |
| marketing sprint, two week plan, sprint planning, marketing backlog | `workflow-cm-sprint` | Run /cm-sprint. |
| daily marketing review, marketing priorities today, daily marketing check | `workflow-cm-daily` | Run /cm-daily. |
| weekly marketing review, marketing week recap, marketing patterns | `workflow-cm-weekly` | Run /cm-weekly. |
| marketing standup, async marketing update, blockers today | `workflow-cm-standup` | Run /cm-standup. |
| end of day marketing, EOD wrap, what shipped today | `workflow-cm-eod` | Run /cm-eod. |
| email campaign, nurture email, announcement email, lifecycle email | `workflow-cm-email` | Run /cm-email. |
| social campaign, social calendar, LinkedIn campaign, Twitter campaign | `workflow-cm-social` | Run /cm-social. |
| campaign retro, launch retro, sprint retro, postmortem | `workflow-cm-retro` | Run /cm-retro. |
| document learnings, capture marketing learning, compound knowledge | `workflow-cm-compound` | Run /cm-compound. |
| setup CMO Skills, bootstrap marketing context, install compounding marketing | `workflow-cm-setup` | Run /cm-setup. |
| remove CMO Skills, uninstall compounding marketing, rollback marketing setup | `workflow-cm-uninstall` | Run /cm-uninstall. |

## Specialist Skill Routes

| User intent | Route | Action |
|---|---|---|
| content plan, content calendar, editorial calendar, blog planning | `content-strategy` | Use content-strategy. |
| single positioning canvas, product positioning, category and alternatives | `positioning` | Use positioning unless the user wants the full workshop. |
| write new marketing copy, headlines, CTA copy, landing page sections | `copywriting` | Use copywriting. |
| edit copy, improve copy, polish copy, copy audit | `copy-editing` | Use copy-editing. |
| SEO audit, technical SEO, search performance issues | `seo-audit` | Use seo-audit. |
| AI search, AEO, GEO, ChatGPT search, answer engine optimization | `ai-seo` | Use ai-seo. |
| ideal customer profile, ICP, target customer, persona development | `icp-research` | Use icp-research. |
| competitor analysis, competitive landscape, alternatives | `competitive-analysis` | Use competitive-analysis. |
| go to market, GTM motion, sales-led or PLG strategy | `gtm-strategy` | Use gtm-strategy. |
| channel selection, acquisition channels, channel mix | `channel-strategy` | Use channel-strategy. |
| pricing strategy, packaging, tiers, pricing page | `pricing-strategy` | Use pricing-strategy. |
| email automation, drip campaign, welcome series, nurture sequence | `email-sequence` | Use email-sequence. |
| conversion optimization, landing page optimization, CRO audit | `page-cro` | Use page-cro. |
| paid ads strategy, ad channels, ROAS, CAC | `paid-ads` | Use paid-ads. |
| PR, press release, media pitch, announcement | `press-pr` | Use press-pr. |
| sales collateral, battle cards, sales materials | `sales-enablement` | Use sales-enablement. |
| RevOps, CRM, lead lifecycle, marketing sales handoff | `revops` | Use revops. |

## Ambiguity Handling

- Content strategy vs. marketing research: ask whether they need research foundation or an editorial calendar.
- Positioning workflow vs. positioning skill: ask whether they want the full workshop or just a positioning canvas.
- Copy workflow vs. copywriting skill: ask whether they want end-to-end research-to-CRO or only draft copy.
