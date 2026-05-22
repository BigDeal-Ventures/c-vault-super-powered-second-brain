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

Use the same `--tool`, `--target`, and `--packs` values you used during install. Always run a dry-run first so you can see which C-Vault-managed files will be refreshed.

### Manual Checkout Update

From a cloned repo:

```bash
cd c-vault-super-powered-second-brain
git pull
npm run validate
node bin/setup.js --dry-run --tool=auto --target="/path/to/vault"
node bin/setup.js --tool=auto --target="/path/to/vault"
```

For a clean update that removes files tracked by the previous install manifest before installing the new release:

```bash
node bin/setup.js --uninstall --target="/path/to/vault"
node bin/setup.js --tool=auto --target="/path/to/vault"
```

### GitHub npx Update

Update directly from GitHub:

```bash
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --dry-run --tool=auto --target="/path/to/vault"
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --tool=auto --target="/path/to/vault"
```

For a clean GitHub-based update:

```bash
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --uninstall --target="/path/to/vault"
npx --yes github:BigDeal-Ventures/c-vault-super-powered-second-brain --tool=auto --target="/path/to/vault"
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
npx @bigdeal-ventures/c-vault@latest --uninstall --target="/path/to/vault"
npx @bigdeal-ventures/c-vault@latest --tool=auto --target="/path/to/vault"
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

C-Vault writes only the generated paths for the selected tool and pack set. Updates refresh those C-Vault-managed files and record the current install in `.c-vault-install.json` so they can be reviewed or removed. If you customize generated C-Vault files directly, commit or back them up before updating.
