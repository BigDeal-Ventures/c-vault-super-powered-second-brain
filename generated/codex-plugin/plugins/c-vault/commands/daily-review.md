---
description: "Daily Review"
---

# /daily-review

This is a generated C-Vault command shim.

Canonical source: pack: C-Vault Core, command: daily-review.md

Execution steps:

1. Follow the embedded canonical workflow below exactly.
2. Resolve vault paths relative to the current workspace or configured vault root.
3. Stop and ask if required context is missing.

---

## Embedded Canonical Workflow

# Daily Review

Use this for a focused daily vault review.

## Workflow

1. Scan today's daily note, recent inbox items, and active project notes supplied by the user.
2. Pull out commitments, blockers, meetings, deadlines, and unfinished threads.
3. Separate work into: do today, schedule, delegate, clarify, and archive.
4. Identify one priority that would make the day successful.
5. Create a short end-of-day checkpoint prompt.

## Output

Use this structure:

```markdown
## Today
- Primary outcome:
- Must do:
- Useful if time:

## Follow-ups
- Waiting on:
- Need to ask:

## Notes to file
- 

## End-of-day checkpoint
- What moved?
- What is stuck?
- What should carry forward?
```

