---
description: "Create Command"
---

# /create-command

This is a generated C-Vault command shim.

Canonical source: pack: C-Vault Core, command: create-command.md

Execution steps:

1. Follow the embedded canonical workflow below exactly.
2. Resolve vault paths relative to the current workspace or configured vault root.
3. Stop and ask if required context is missing.

---

## Embedded Canonical Workflow

# Create Command

Use this to design a reusable agent command for the vault.

## Workflow

1. Clarify the trigger: when should this command be used?
2. Define inputs the command needs.
3. Define outputs the command must produce.
4. Write the workflow as numbered steps.
5. Add guardrails for privacy, accuracy, and scope.
6. Include a short example invocation if useful.

## Command quality checklist

- The command has one clear purpose.
- Steps are action-oriented and deterministic.
- The output format is explicit.
- It avoids local paths, secrets, and personal assumptions.
- It works across Claude Code, Codex, Cursor, OpenCode, and plain Markdown.

## Output

Return a ready-to-save Markdown command with:

- Title
- Purpose
- Inputs
- Workflow
- Guardrails
- Output format

