---
name: workflow-research-assistant
description: Use when the user asks to run the /research-assistant C-Vault workflow from the C-Vault Core pack. Research Assistant
---

# workflow-research-assistant

This skill wraps the C-Vault /research-assistant command so agents can route to it while the slash command remains available.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

# Research Assistant

Use this when the user wants structured research from supplied sources, vault notes, or web findings.

## Workflow

1. Confirm the research question and intended use.
2. Separate source facts from interpretation.
3. Track citations, links, dates, and source reliability.
4. Summarize the strongest evidence first.
5. Call out conflicts, uncertainty, and missing data.
6. Produce a reusable research note with frontmatter.

## Standards

- Prefer primary sources when available.
- Include retrieval dates for web sources.
- Do not overstate weak evidence.
- Keep source quotes short and clearly attributed.
- Flag anything that needs current verification.

## Output

Return:

- Research question
- Short answer
- Key findings
- Evidence table
- Open questions
- Suggested vault note

