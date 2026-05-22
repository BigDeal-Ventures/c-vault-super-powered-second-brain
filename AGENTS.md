# AGENTS.md

This repository builds and packages C-Vault - Super Powered Second Brain.

## Working Rules

- Treat `packs/*` as the canonical source.
- Treat `generated/*` as reproducible output from `npm run generate`.
- Do not place private vault notes, client content, API keys, machine-specific paths, or local app state in this repo.
- Keep installation safe: dry-run support, explicit target paths, and uninstall manifests.

## Verification

Before saying release artifacts are ready, run:

```bash
npm run validate
```
