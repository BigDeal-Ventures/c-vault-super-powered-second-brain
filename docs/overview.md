# C-Vault Documentation Overview

C-Vault - Super Powered Second Brain is a modular vault and agent-workflow distribution. It packages a clean Obsidian starter, reusable second-brain commands, Claude Code skills, Codex skills and plugin output, Cursor rules, OpenCode commands, and CMO Skills.

## What Gets Installed

- Core second-brain workflows for capture, daily review, weekly synthesis, research, writing cleanup, client setup, and command creation.
- Obsidian starter folders and templates for projects, clients, research notes, decisions, and daily notes.
- `using-c-vault`, a routing skill that maps natural requests to the right workflow or specialist skill.
- CMO Skills v1.6.0 workflows and specialist marketing skills when the `cmo-skills` pack is installed.
- Reference docs under `06_Metadata/Reference` for the guide, command catalog, skill catalog, examples, and CMO Skills.

## Main Installed Docs

- `C-Vault Guide.md` explains the overall system and safety model.
- `Core Workflows.md` explains the second-brain operating loop.
- `CMO Skills Guide.md` explains marketing workflows, specialist skills, MCP notes, and integrations.
- `Command Catalog.md` lists every slash command generated from installed packs.
- `Skill Catalog.md` lists every installed specialist skill.
- `Examples.md` gives practical slash-command and natural-language examples.

## Safety

C-Vault installs are safe by default. The installer records generated files in `.c-vault-install.json`, updates only files that still match the prior generated version, and skips local edits as conflicts. Use `--dry-run` before installing into an existing vault.
