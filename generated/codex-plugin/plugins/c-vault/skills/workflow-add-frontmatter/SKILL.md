---
name: workflow-add-frontmatter
description: Use when the user asks to run the /add-frontmatter C-Vault workflow from the C-Vault Core pack. Add Frontmatter
---

# workflow-add-frontmatter

This skill wraps the C-Vault /add-frontmatter command so agents can route to it while the slash command remains available.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

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

