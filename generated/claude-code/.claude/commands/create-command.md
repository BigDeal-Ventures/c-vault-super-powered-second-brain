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
