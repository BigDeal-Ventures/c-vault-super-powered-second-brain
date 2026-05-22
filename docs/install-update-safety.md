# Install and Update Safety

C-Vault is designed to be safe to test inside an existing vault or project.

## Dry Run First

Always preview changes:

```bash
node bin/setup.js --dry-run --tool=auto --target="/path/to/vault"
```

The dry run reports files that would be created, updated, left unchanged, removed, or skipped as conflicts.

## Update Rules

- Missing files are created.
- Files that still match the last C-Vault install are updated.
- Files already matching the new release are left unchanged.
- Locally modified tracked files are skipped and reported as conflicts.
- Obsolete tracked files are kept unless `--clean` is used.

## Force and Backup

Only use force when you intentionally want generated files to replace local edits:

```bash
node bin/setup.js --force --backup --tool=auto --target="/path/to/vault"
```

`--backup` writes `.bak` copies before forced overwrite or removal.

## Existing Vaults

If you are testing inside a real Obsidian vault, start with a narrow target:

```bash
node bin/setup.js --dry-run --tool=claude-code --target="/path/to/vault"
node bin/setup.js --dry-run --tool=obsidian --target="/path/to/vault"
```

Review conflicts before running without `--dry-run`.
