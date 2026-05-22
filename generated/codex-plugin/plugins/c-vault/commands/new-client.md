---
description: "New Client"
---

# /new-client

This is a generated C-Vault command shim.

Canonical source: pack: C-Vault Core, command: new-client.md

Execution steps:

1. Follow the embedded canonical workflow below exactly.
2. Resolve vault paths relative to the current workspace or configured vault root.
3. Stop and ask if required context is missing.

---

## Embedded Canonical Workflow

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

