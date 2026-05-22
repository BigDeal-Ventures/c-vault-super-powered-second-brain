---
name: workflow-daily-review
description: Use when the user asks to run the /daily-review C-Vault workflow from the C-Vault Core pack. Daily Review
---

# workflow-daily-review

This skill wraps the C-Vault /daily-review command so it can be enabled or disabled from plugin skill settings.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

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

