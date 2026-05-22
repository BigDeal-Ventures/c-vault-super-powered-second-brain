---
name: workflow-de-ai-ify
description: Use when the user asks to run the /de-ai-ify C-Vault workflow from the C-Vault Core pack. De-AI-ify
---

# workflow-de-ai-ify

This skill wraps the C-Vault /de-ai-ify command so it can be enabled or disabled from plugin skill settings.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

# De-AI-ify

Use this to make AI-assisted writing sound more specific, grounded, and human.

## Workflow

1. Identify the audience, purpose, and desired tone.
2. Remove generic intensifiers, filler, and inflated claims.
3. Replace vague benefits with concrete details from the provided context.
4. Vary sentence length without making the writing theatrical.
5. Keep the author's meaning and constraints intact.
6. Return a clean rewrite plus a short change note.

## Remove or reduce

- Generic phrases such as "game-changing", "unlock", "seamless", and "leverage" unless they are truly accurate.
- Empty certainty.
- Repeated sentence structures.
- Marketing claims that are not supported by evidence.

## Output

Return:

- Rewritten version
- Notes on what changed
- Any claims that still need proof

