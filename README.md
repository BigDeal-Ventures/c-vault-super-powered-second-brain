# C-Vault - Super Powered Second Brain

C-Vault is a release-ready Obsidian second-brain starter with bundled AI workflows for Claude Code, Codex, Cursor, OpenCode, Claude Desktop, and Obsidian.

It is inspired by Claudesidian's simple vault-first setup, then adds a modular pack system. The first release includes:

- `core` - daily second-brain workflows, PARA folders, templates, and vault operating guidance.
- `cmo-skills` - CMO Skills / Compounding Marketing v1.6.0 workflows and specialist marketing skills.

## Quick Start

### Manual Install

Clone the repo and run the local installer from the checkout:

```bash
git clone https://github.com/BigDeal-Ventures/c-vault-super-powered-second-brain.git
cd c-vault-super-powered-second-brain
npm run validate
node bin/setup.js --dry-run
node bin/setup.js --tool=auto --target="/path/to/vault"
```

You can also install a specific surface:

```bash
node bin/setup.js --tool=claude-code --target="/path/to/project"
node bin/setup.js --tool=codex --target="/path/to/project"
node bin/setup.js --tool=cursor --target="/path/to/project"
node bin/setup.js --tool=opencode --target="/path/to/project"
node bin/setup.js --tool=obsidian --target="/path/to/vault"
```

For pack-specific installs:

```bash
node bin/setup.js --packs=core --target="/path/to/vault"
node bin/setup.js --packs=core,cmo-skills --target="/path/to/vault"
```

To remove files created by the installer:

```bash
node bin/setup.js --uninstall --target="/path/to/vault"
```

By default, uninstall skips tracked files that were modified after installation. Use `--force --backup` only when you want to remove modified tracked files and keep `.bak` copies first.

### GitHub Install

Run the installer directly from GitHub:

```bash
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --dry-run
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --tool=auto --target="/path/to/vault"
```

### npm Install

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

Install only selected packs:

```bash
npx @bigdeal-ventures/c-vault --packs=core
npx @bigdeal-ventures/c-vault --packs=core,cmo-skills
```

### Codex Plugin Install

After cloning the repo and running `npm run generate`, add the local marketplace in Codex:

```bash
/plugin marketplace add /path/to/c-vault-super-powered-second-brain
/plugin install c-vault
```

The generated Codex plugin includes both `commands/` and `skills/`. The `workflow-*` skills mirror slash-command workflows so they can be enabled or disabled from the plugin detail screen.

## Updating C-Vault

Use the same `--tool`, `--target`, and `--packs` values you used during install. Always run a dry-run first so you can see which C-Vault-managed files will be created, updated, left unchanged, removed, or skipped as conflicts.

C-Vault updates are safe by default:

- Files that are missing are created.
- Files that still match the last C-Vault install are updated.
- Files that already match the new release are left unchanged.
- Files modified by the user are skipped and reported as conflicts.
- Obsolete tracked files are kept unless you pass `--clean`.

Useful update flags:

```bash
--clean        remove obsolete C-Vault-tracked files that have not been modified
--force        overwrite or remove modified C-Vault-tracked files
--backup       create .bak files before forced overwrite/removal
```

### Manual Checkout Update

From a cloned repo:

```bash
cd c-vault-super-powered-second-brain
git pull
npm run validate
node bin/setup.js --dry-run --tool=auto --target="/path/to/vault"
node bin/setup.js --tool=auto --target="/path/to/vault"
```

For a clean update that also removes obsolete tracked files from older releases:

```bash
node bin/setup.js --dry-run --clean --tool=auto --target="/path/to/vault"
node bin/setup.js --clean --tool=auto --target="/path/to/vault"
```

If the dry-run reports conflicts and you intentionally want the release version to replace local edits:

```bash
node bin/setup.js --force --backup --tool=auto --target="/path/to/vault"
```

### GitHub npx Update

Update directly from GitHub:

```bash
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --dry-run --tool=auto --target="/path/to/vault"
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --tool=auto --target="/path/to/vault"
```

For a clean GitHub-based update:

```bash
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --dry-run --clean --tool=auto --target="/path/to/vault"
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --clean --tool=auto --target="/path/to/vault"
```

To intentionally overwrite local edits while preserving backups:

```bash
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --force --backup --tool=auto --target="/path/to/vault"
```

To pin a specific release tag or commit:

```bash
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain#v0.1.0 --tool=auto --target="/path/to/vault"
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain#COMMIT_SHA --tool=auto --target="/path/to/vault"
```

### npm Update

Use `@latest` for the newest published release:

```bash
npx @bigdeal-ventures/c-vault@latest --dry-run --tool=auto --target="/path/to/vault"
npx @bigdeal-ventures/c-vault@latest --tool=auto --target="/path/to/vault"
```

For a clean npm-based update:

```bash
npx @bigdeal-ventures/c-vault@latest --dry-run --clean --tool=auto --target="/path/to/vault"
npx @bigdeal-ventures/c-vault@latest --clean --tool=auto --target="/path/to/vault"
```

To intentionally overwrite local edits while preserving backups:

```bash
npx @bigdeal-ventures/c-vault@latest --force --backup --tool=auto --target="/path/to/vault"
```

To pin a specific published version:

```bash
npx @bigdeal-ventures/c-vault@0.1.0 --tool=auto --target="/path/to/vault"
```

### Codex Plugin Update

For a local Codex plugin checkout, pull the latest source, regenerate the plugin, then reinstall it from the local marketplace:

```bash
cd c-vault-super-powered-second-brain
git pull
npm run generate
/plugin remove c-vault
/plugin install c-vault
```

Re-run the project installer as well if you also installed the generated `.agents/skills`, `AGENTS.md`, Claude Code commands, Cursor rules, OpenCode commands, or Obsidian templates into a vault.

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

The Codex plugin mirrors the Superpowers plugin pattern: generated `workflow-*` skills wrap slash-command workflows so individual workflows and specialist skills can be enabled or disabled from the plugin detail screen.

```bash
npm run generate
npm run validate
```

## Safety

C-Vault writes only the generated paths for the selected tool and pack set. The installer records file hashes in `.c-vault-install.json`; later updates use those hashes to avoid overwriting local edits. Modified tracked files are skipped by default during updates and uninstall. Use `--force --backup` when you intentionally want to replace or remove modified tracked files while keeping `.bak` copies.
