---
name: workflow-pragmatic-review
description: Use when the user asks to run the /pragmatic-review C-Vault workflow from the C-Vault Core pack. Pragmatic Review
---

# workflow-pragmatic-review

This skill wraps the C-Vault /pragmatic-review command so it can be enabled or disabled from plugin skill settings.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

# Pragmatic Review

Use this to review a plan, document, workflow, or implementation with a bias toward what will actually work.

## Workflow

1. State the goal being reviewed.
2. Identify the strongest parts first only if they affect execution.
3. List blockers, risks, missing assumptions, and unclear ownership.
4. Separate must-fix issues from nice-to-have improvements.
5. Recommend a smaller or safer path if the current plan is too broad.
6. End with a concrete decision or next action.

## Review lens

- Does this solve the stated problem?
- Is the scope small enough to finish?
- Are dependencies and owners clear?
- What breaks if assumptions are wrong?
- What evidence would prove this is ready?

## Output

Lead with findings ordered by severity, then include:

- Open questions
- Recommended next action
- Optional cleanup

