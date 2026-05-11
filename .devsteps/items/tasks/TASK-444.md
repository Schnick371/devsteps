Resolve VS Code-side behavior clarification and record a decision gate outcome before downstream refactor work can proceed.

Decision inputs:
- VS Code #260134
- Copilot #11480
- MCP SEP #1395

---
**Escalation 2026-05-11**: Decision gate explicitly requires VS Code #260134, Copilot #11480, MCP SEP #1395 outcomes. None of these have shipped. The current double-prefix state is documented in `docs/architecture/mcp-tool-inventory.md` (TASK-443). Re-open this item with `status: planned` once VS Code 1.110+ ships its decision and the upstream MCP SEP is merged or rejected.