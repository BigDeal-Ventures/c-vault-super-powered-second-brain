---
description: "/cm:copy — End-to-End Copywriting Workflow"
---

# /cm-copy

This is a generated C-Vault command shim.

Canonical source: pack: CMO Skills, command: cm-copy.md

Execution steps:

1. Follow the embedded canonical workflow below exactly.
2. Resolve vault paths relative to the current workspace or configured vault root.
3. Stop and ask if required context is missing.

---

## Embedded Canonical Workflow

# /cm:copy — End-to-End Copywriting Workflow

Complete copywriting workflow from research to polished copy with CRO review.

## What It Does

Write conversion-focused copy for any page type, with built-in quality assurance.

## Process

1. **Read Positioning & Messaging**
   - Check for positioning canvas
   - Check for messaging framework
   - If missing → Recommend running `/cm:position` first

2. **Define Page Context**
   - Ask: What page? (homepage, landing, pricing, feature)
   - Ask: Target audience segment?
   - Ask: Primary goal? (signup, demo, download)

3. **Run Copywriting Skill**
   - Execute `copywriting` skill
   - Output: Multiple headline options, section copy, CTA copy

4. **Run Page CRO (QA)**
   - Execute `page-cro` skill on draft copy
   - Audit against conversion best practices
   - Output: CRO recommendations and copy improvements

5. **Provide Final Copy**
   - Incorporate CRO feedback
   - Deliver polished copy ready for design/dev

6. **Suggest A/B Tests**
   - Identify high-impact elements to test
   - Provide test hypotheses

## When to Use

- Writing new landing page
- Refreshing homepage copy
- Launching new feature page
- Optimizing low-converting pages

## Prerequisites

- Positioning and messaging defined (or run `/cm:position` first)

## Time Investment

1-2 hours

## Output

- Page copy (headlines, body, CTAs)
- CRO audit and recommendations
- A/B test ideas

