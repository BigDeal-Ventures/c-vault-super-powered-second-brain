---
name: workflow-new-client
description: Use when the user asks to run the /new-client C-Vault workflow from the C-Vault Core pack. New Client
---

# workflow-new-client

This skill wraps the C-Vault /new-client command so it can be enabled or disabled from plugin skill settings.

Follow the embedded workflow exactly. Resolve vault paths relative to the current workspace or configured vault root.

---

## Embedded Workflow

# New Client

Use this to set up a clean client workspace inside a vault.

## Workflow

1. Ask for the client name, engagement type, start date, and confidentiality requirements.
2. Create a neutral folder name and client README outline.
3. Define standard subfolders only if the user wants them.
4. Capture goals, stakeholders, communication norms, assets, and open questions.
5. Add a handoff section for future agents.
6. Avoid storing credentials, private keys, or contract terms unless the vault owner explicitly requests it.

## Suggested structure

```text
07_Clients/
  Client Name/
    README.md
    Notes/
    Deliverables/
    Research/
    Archive/
```

## Output

Return:

- Proposed folder name
- README content
- Initial checklist
- Questions to confirm before filing sensitive details

