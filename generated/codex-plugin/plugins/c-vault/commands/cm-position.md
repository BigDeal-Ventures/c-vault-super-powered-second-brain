---
description: "/cm:position — Full Positioning Workshop"
---

# /cm-position

This is a generated C-Vault command shim.

Canonical source: pack: CMO Skills, command: cm-position.md

Execution steps:

1. Follow the embedded canonical workflow below exactly.
2. Resolve vault paths relative to the current workspace or configured vault root.
3. Stop and ask if required context is missing.

---

## Embedded Canonical Workflow

# /cm:position — Full Positioning Workshop

Complete positioning workshop using April Dunford's framework + messaging development.

## What It Does

Runs the full positioning stack: positioning → messaging → value props.

## Process

1. **Run Positioning Skill**
   - Execute `positioning` skill
   - Output: Positioning canvas (alternatives, attributes, value, best-fit customers, category)

2. **Run Messaging Framework**
   - Execute `messaging-framework` skill
   - Convert positioning into messaging pillars
   - Output: Messaging framework with proof points

3. **Run Value Proposition** (per segment)
   - Execute `value-proposition` skill for each customer segment
   - Output: Value proposition canvas per segment

4. **Synthesize into Positioning Package**
   - Combine all outputs
   - Create single positioning document
   - Save to `deliverables/positioning-package.md`

5. **Recommend Next Steps**
   - Update website copy → Run `/cm:copy`
   - Plan launch → Run `/cm:launch`
   - Create sales materials → Run `sales-enablement` skill

## When to Use

- Launching a new product
- Repositioning existing product
- Entering new market
- Confused messaging across channels

## Prerequisites

- Run `/cm:research` first (or have existing product-market context)

## Time Investment

3-5 hours

## Output

- Positioning canvas
- Messaging framework
- Value proposition canvases (per segment)
- Unified positioning package document

