---
name: workflow-thinking-partner
description: Use when the user asks to run the /thinking-partner C-Vault workflow from the C-Vault Core pack. Thinking Partner
---

# workflow-thinking-partner

This skill wraps the C-Vault /thinking-partner command so agents can route to it while the slash command remains available.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

# Thinking Partner

Use this when the user wants help thinking through a messy idea, decision, plan, or draft.

## Workflow

1. Restate the actual question in one sentence.
2. Separate facts, assumptions, constraints, and open questions.
3. Identify the decision that would make the next step easier.
4. Offer two or three practical options with trade-offs.
5. Recommend one option and explain the reasoning.
6. End with the smallest useful next action.

## Guardrails

- Do not invent context that is not in the vault or conversation.
- Mark assumptions clearly.
- If the topic involves private or sensitive material, keep the answer local to the provided context.
- Prefer concrete next steps over broad frameworks.

## Output

Return a concise analysis with these headings:

- `Question`
- `What matters`
- `Options`
- `Recommendation`
- `Next step`

