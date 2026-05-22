---
description: "Add Frontmatter"
---

# /add-frontmatter

This is a generated C-Vault command shim.

Canonical source: pack: C-Vault Core, command: add-frontmatter.md

Execution steps:

1. Follow the embedded canonical workflow below exactly.
2. Resolve vault paths relative to the current workspace or configured vault root.
3. Stop and ask if required context is missing.

---

## Embedded Canonical Workflow

# Add Frontmatter

Use this to add or normalize YAML frontmatter for a Markdown note.

## Workflow

1. Inspect the note title, folder, content, and existing metadata.
2. Preserve any existing useful fields.
3. Add only fields that help retrieval, review, or automation.
4. Use ISO dates: `YYYY-MM-DD`.
5. Keep tags lowercase and hyphenated.
6. Do not add private identifiers unless the user supplies them and asks for them.

## Default fields

```yaml
---
title: ""
type: note
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: []
---
```

## Common type values

- `daily`
- `project`
- `area`
- `resource`
- `research`
- `client`
- `decision`
- `meeting`
- `archive`

## Output

Return the complete note with normalized frontmatter.

