# Core Workflows

[Docs Home](../README.md)

The core pack is the reusable second-brain layer. It includes vault structure, templates, shared agent instructions, and workflow commands that work across Claude Code, Codex, Cursor, OpenCode, and Obsidian.

## Commands

- `/daily-review` - review today, identify open loops, and choose next actions.
- `/weekly-synthesis` - synthesize the week, extract patterns, and prepare next week.
- `/inbox-processor` - process raw capture notes into their long-term home.
- `/thinking-partner` - work through ideas, decisions, tradeoffs, and uncertainty.
- `/research-assistant` - turn research questions and sources into structured notes.
- `/de-ai-ify` - make writing more grounded, specific, and human.
- `/add-frontmatter` - normalize note metadata.
- `/create-command` - create a reusable workflow command.
- `/new-client` - scaffold a client workspace.
- `/pragmatic-review` - review plans for risk, missing steps, and practical next actions.

## Reference Model

Core docs are generated into `06_Metadata/Reference`. They cover the operating guide, vault structure, privacy and safety, voice and style, and agent collaboration.

## Recommended Flow

1. Capture quickly in `00_Inbox`.
2. Run `/daily-review` to plan or close the day.
3. Process raw notes with `/inbox-processor`.
4. Use `/thinking-partner`, `/research-assistant`, and `/de-ai-ify` during focused work.
5. Run `/weekly-synthesis` to turn daily work into durable knowledge.

## Related Docs

- [Overview](overview.md)
- [Examples](examples.md)
- [Install and Update Safety](install-update-safety.md)
