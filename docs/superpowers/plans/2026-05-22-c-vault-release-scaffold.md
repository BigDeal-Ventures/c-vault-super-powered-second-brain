# C-Vault Release Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new release/distribution repo for C-Vault - Super Powered Second Brain with modular packs, a safe installer, and generated tool adapters.

**Architecture:** Canonical source lives in `packs/*`. Generator scripts produce Claude Code, Codex, Cursor, OpenCode, and Obsidian outputs under `generated/`. The installer copies selected generated output into a target project using a dry-run/install/uninstall manifest model.

**Tech Stack:** Node.js 18+, built-in `node:test`, CommonJS CLI modules, Markdown/JSON/TOML generation.

---

### Task 1: Repository Foundation

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `AGENTS.md`
- Create: `CLAUDE.md`
- Create: `install.sh`
- Create: `docs/superpowers/plans/2026-05-22-c-vault-release-scaffold.md`

- [x] **Step 1: Create the empty repo**

Run: `git init <repo-root>`

- [x] **Step 2: Add package metadata and docs**

Create package scripts for `test`, `generate`, `validate:packs`, `validate:generated`, and `smoke:dry-run`.

- [x] **Step 3: Verify metadata**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('ok')"`

Expected: `ok`

### Task 2: Pack Loader and Generator

**Files:**
- Create: `test/generator.test.js`
- Create: `lib/pack-loader.js`
- Create: `lib/generator.js`
- Create: `scripts/generate.js`
- Create: `scripts/validate-packs.js`
- Create: `scripts/validate-generated.js`

- [x] **Step 1: Write failing generator tests**

Test pack discovery, generated Claude commands, Codex plugin shims, Cursor rules, OpenCode commands, and Obsidian skeleton output.

- [x] **Step 2: Run tests and confirm failure**

Run: `npm test`

Expected: failure because `lib/generator.js` does not exist yet.

- [x] **Step 3: Implement minimal generator**

Implement deterministic filesystem generation from `packs/*/pack.json`, `commands/*.md`, `skills/*/SKILL.md`, and `templates/*.md`.

- [x] **Step 4: Verify tests pass**

Run: `npm test`

Expected: all tests pass.

### Task 3: Installer

**Files:**
- Create: `test/installer.test.js`
- Create: `lib/installer.js`
- Create: `bin/setup.js`
- Create: `scripts/smoke-install.js`

- [x] **Step 1: Write failing installer tests**

Test dry-run plans, project install, manifest creation, uninstall, and supported tool validation.

- [x] **Step 2: Run tests and confirm failure**

Run: `npm test`

Expected: installer tests fail because implementation is missing.

- [x] **Step 3: Implement minimal installer**

Support `--tool`, `--scope`, `--packs`, `--target`, `--dry-run`, `--uninstall`, `--help`, and `--version`.

- [x] **Step 4: Verify tests pass**

Run: `npm test`

Expected: all tests pass.

### Task 4: Pack Extraction

**Files:**
- Create: `packs/core/pack.json`
- Create: `packs/core/commands/*.md`
- Create: `packs/core/templates/*.md`
- Create: `packs/core/obsidian/**`
- Create: `packs/core/instructions/*.md`
- Create: `packs/cmo-skills/pack.json`
- Create: `packs/cmo-skills/commands/*.md`
- Create: `packs/cmo-skills/skills/*/SKILL.md`
- Create: `packs/cmo-skills/mcp/**`
- Create: `packs/cmo-skills/integrations/**`

- [x] **Step 1: Extract sanitized core workflows**

Copy only reusable public workflow structure. Remove personal profile, active work, client content, and local paths.

- [x] **Step 2: Extract CMO skills**

Copy from the local `compounding-marketing` checkout excluding `.git`, `node_modules`, local settings, and QA internals.

- [x] **Step 3: Verify pack validation**

Run: `npm run validate:packs`

Expected: pack counts and required files are valid.

### Task 5: Generated Adapters and Release Check

**Files:**
- Generate: `generated/**`
- Create: `.agents/plugins/marketplace.json`

- [x] **Step 1: Generate adapters**

Run: `npm run generate`

Expected: generated Claude, Codex, Cursor, OpenCode, and Obsidian outputs exist.

- [x] **Step 2: Validate generated outputs**

Run: `npm run validate:generated`

Expected: no missing manifests, no hardcoded local user paths, no secret-like config values.

- [x] **Step 3: Smoke dry-run installs**

Run: `npm run smoke:dry-run`

Expected: all supported tool dry-runs exit 0.

- [x] **Step 4: Final verification**

Run: `npm test && npm run validate:packs && npm run generate && npm run validate:generated && npm run smoke:dry-run`

Expected: every command exits 0.
