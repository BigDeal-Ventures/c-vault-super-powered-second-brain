---
name: using-c-vault
description: Use when C-Vault is tagged or when the user asks for broad second-brain, vault workflow, Obsidian, or CMO marketing help without naming a specific C-Vault skill or command
---

# Using C-Vault

C-Vault is a routing layer for second-brain workflows, vault operations, and CMO Skills. Before answering a C-Vault request, choose the smallest matching workflow or specialist skill.

After selecting a route, invoke or load the matching skill using the current host environment, then follow that skill. In Claude Code, use the Skill tool. In Codex, use the selected installed skill or workflow skill. Do not stop at naming the route.

## Routing Priority

1. If the user names a slash command, run that command.
2. If the request matches one workflow clearly, use that `workflow-*` skill.
3. If the request needs a domain deliverable rather than a workflow, use the specialist skill.
4. If two routes are plausible, ask one short clarification.
5. If no route fits, say no C-Vault route matched and ask what kind of help is needed.

## Reference

Use `references/routing.md` for deterministic route choices and examples.

## Guardrails

- Do not invent vault paths, source files, or private context.
- Ask before writing or restructuring vault content unless the user explicitly requested edits.
- Keep direct slash commands and individual skill requests authoritative.
