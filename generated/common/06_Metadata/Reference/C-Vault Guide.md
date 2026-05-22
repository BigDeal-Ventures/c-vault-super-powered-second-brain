# C-Vault - Super Powered Second Brain

C-Vault is a modular second-brain setup for Obsidian and agentic tools. It bundles vault structure, daily workflows, reusable commands, specialist skills, and generated adapters for Claude Code, Codex, Cursor, OpenCode, and Obsidian.

## Installed Packs

- **C-Vault Core v0.1.0** - Sanitized reusable second-brain workflows, templates, starter vault folders, and agent instructions.
- **CMO Skills v1.6.0** - Reusable Compounding Marketing workflows and specialist CMO skills for B2B SaaS marketing.

## Where to Start

1. Read `Core Workflows.md` to understand the second-brain operating model.
2. Read `Command Catalog.md` when you know the workflow you want to run.
3. Read `Skill Catalog.md` when you want a specialist capability.
4. Read `Examples.md` for practical prompts and slash-command examples.
5. Read `CMO Skills Guide.md` for the overview, then `CMO Skills/Start Here.md`, `CMO Skills/Decision Guide.md`, and `CMO Skills/Playbooks.md` for real work.

## Installed Surfaces

- Claude Code: `.claude/commands`, `.claude/skills`, and `CLAUDE.md`.
- Codex: `.agents/skills`, `AGENTS.md`, and optional Codex plugin skills.
- Cursor: `.cursor/rules` and `AGENTS.md`.
- OpenCode: `.opencode/command` and `AGENTS.md`.
- Obsidian: starter folders, templates, and reference docs under `06_Metadata/Reference`.

## Safety Model

C-Vault-managed installs use `.c-vault-install.json` to track generated files and hashes. Updates create missing files, update unchanged tracked files, and skip modified files as conflicts unless you intentionally use `--force`. Use `--dry-run` before installing or updating a real vault.
