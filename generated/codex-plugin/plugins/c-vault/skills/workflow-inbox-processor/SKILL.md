---
name: workflow-inbox-processor
description: Use when the user asks to run the /inbox-processor C-Vault workflow from the C-Vault Core pack. Inbox Processor
---

# workflow-inbox-processor

This skill wraps the C-Vault /inbox-processor command so agents can route to it while the slash command remains available.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

# Inbox Processor

Use this to turn raw inbox notes into organized vault material.

## Workflow

1. Read the selected inbox note or pasted text.
2. Identify the note type: task, project idea, resource, research, meeting note, reference, or archive.
3. Extract decisions, tasks, dates, names, links, and follow-ups.
4. Propose a destination folder and final note title.
5. Rewrite the note into a durable form using clear headings and frontmatter.
6. Preserve the original meaning; do not add unsupported claims.

## Routing

- Projects go to `01_Projects/`.
- Ongoing responsibilities go to `02_Areas/`.
- Reusable references go to `03_Resources/`.
- Completed or inactive material goes to `04_Archive/`.
- Attachments stay in `05_Attachments/`.
- Templates and operating docs go to `06_Metadata/`.
- Client-facing work goes to `07_Clients/` only when the vault owner confirms the client context.

## Output

Return:

- Suggested destination
- Clean note title
- Rewritten note body
- Follow-up tasks
- Questions that block filing

