---
description: "Inbox Processor"
---

# /inbox-processor

This is a generated C-Vault command shim.

Canonical source: pack: C-Vault Core, command: inbox-processor.md

Execution steps:

1. Follow the embedded canonical workflow below exactly.
2. Resolve vault paths relative to the current workspace or configured vault root.
3. Stop and ask if required context is missing.

---

## Embedded Canonical Workflow

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

