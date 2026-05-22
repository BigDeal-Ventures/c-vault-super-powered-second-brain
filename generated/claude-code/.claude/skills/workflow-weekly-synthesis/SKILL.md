---
name: workflow-weekly-synthesis
description: Use when the user asks to run the /weekly-synthesis C-Vault workflow from the C-Vault Core pack. Weekly Synthesis
---

# workflow-weekly-synthesis

This skill wraps the C-Vault /weekly-synthesis command so agents can route to it while the slash command remains available.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

# Weekly Synthesis

Use this to convert a week's notes into decisions, progress, and next actions.

## Workflow

1. Review the week's daily notes, inbox items, project updates, and decisions provided by the user.
2. Group updates by project, area, or theme.
3. Identify completed work, unresolved questions, repeating patterns, and risks.
4. Convert scattered action items into a prioritized next-week list.
5. Note what should be archived, promoted to a durable resource, or turned into a project.

## Output

Use this structure:

```markdown
# Weekly Synthesis

## Progress
- 

## Decisions
- 

## Open loops
- 

## Patterns
- 

## Next week
- 

## Vault maintenance
- 
```

