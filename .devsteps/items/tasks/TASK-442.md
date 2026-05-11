Validate MCP tool naming composition matrix and enforce a double-prefix guard to prevent accidental repeated namespace prefixes. Must confirm behavior against current server/client expectations and document fail/pass criteria.

Blocker context:
- VS Code #260134
- Copilot #11480
- MCP SEP #1395

---
**Escalation 2026-05-11**: This task is blocked on the same external decision gate as TASK-444 — VS Code #260134, Copilot #11480, MCP SEP #1395. The 6 redundantly-prefixed tools (`devsteps_doc_read_content`, `devsteps_docs_*`) surface as `mcp_devsteps_devsteps_*` (see `docs/architecture/mcp-tool-inventory.md` from TASK-443). Naming composition matrix work is paused until the upstream tools-namespacing convention is settled. Re-open this item with `status: planned` once VS Code 1.110+ ships its decision.