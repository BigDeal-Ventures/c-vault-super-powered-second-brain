# CMO Skills Pack

This pack contains public reusable content copied from the Compounding Marketing project.

## Contents

- `commands/*.md` - CMO workflow commands.
- `skills/*/SKILL.md` - specialist marketing skills.
- `skills/*/references/*.md` - public supporting material used by skills.
- `mcp/**` - MCP setup notes and placeholder configs for research tools.
- `integrations/**` - integration setup notes for analytics and task-tracking tools.

## Generation Notes

- Treat `pack.json` as the pack manifest and these directories as canonical source inputs.
- Keep generated target-specific output outside this pack.
- MCP configs use environment-variable placeholders such as `${EXA_API_KEY}` and `${PERPLEXITY_API_KEY}`. Do not commit real keys here.
- Local config, package locks, `.git`, `node_modules`, QA reports, internal notes, and tool-local settings are intentionally excluded.
