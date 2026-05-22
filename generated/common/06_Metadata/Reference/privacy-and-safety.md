# Privacy and Safety

This core pack must remain safe to publish.

## Never include

- API keys, tokens, passwords, or private certificates.
- Local absolute paths.
- Personal identity details beyond intentionally public package metadata.
- Client names, active client work, contracts, or confidential strategy.
- Private MCP server configuration.
- Raw exports from email, chat, calendars, or databases.

## Review checklist

Before publishing or sharing:

1. Search for local path markers such as home-directory prefixes and drive roots.
2. Search for secret-like names such as `token`, `api_key`, `password`, `secret`, and `private_key`.
3. Search for client names and active project names.
4. Confirm examples use placeholders, not real accounts.
5. Confirm templates are generic and reusable.

## Handling sensitive notes

If sensitive material is required for a private vault, keep it outside this distributable pack and document only the placeholder or setup pattern.
