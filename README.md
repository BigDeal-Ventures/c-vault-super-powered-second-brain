# C-Vault - Super Powered Second Brain

C-Vault is a release-ready Obsidian second-brain starter with bundled AI workflows for Claude Code, Codex, Cursor, OpenCode, Claude Desktop, and Obsidian.

It is inspired by Claudesidian's simple vault-first setup, then adds a modular pack system. The first release includes:

- `core` - daily second-brain workflows, PARA folders, templates, and vault operating guidance.
- `cmo-skills` - CMO Skills / Compounding Marketing workflows and specialist marketing skills.

## Quick Start

```bash
npx @bigdeal-ventures/c-vault
```

Preview without writing files:

```bash
npx @bigdeal-ventures/c-vault --dry-run
```

Install into a specific vault or project:

```bash
npx @bigdeal-ventures/c-vault --tool=auto --target="/path/to/vault"
```

## Supported Targets

| Target | Output |
|---|---|
| Claude Code | `.claude/commands`, `.claude/skills`, `CLAUDE.md` |
| Codex CLI/Desktop | `.agents/skills`, `AGENTS.md`, Codex plugin shims |
| Cursor | `.cursor/rules/*.mdc`, `AGENTS.md` |
| OpenCode | `.opencode/command/*.md`, `AGENTS.md` |
| Claude Desktop | MCP-oriented generated package and config notes |
| Obsidian | PARA folders, templates, starter notes |

## Project Model

Canonical source lives in `packs/*`. Generated outputs live in `generated/*`.

```bash
npm run generate
npm run validate
```

## Safety

C-Vault is additive by default. Existing files are not silently overwritten. Install actions are recorded in `.c-vault-install.json` so they can be reviewed or removed.
