Regenerate canonical MCP tool inventory from current schemas/tool registrations and reconcile naming scope across server-exposed tools, docs, and consumers.

Blocker context:
- VS Code #260134
- Copilot #11480
- MCP SEP #1395

---
**Done 2026-05-11**: Inventory written to `docs/architecture/mcp-tool-inventory.md`. 34 tools total (28 bare, 6 with redundant `devsteps_` prefix that double-prefix when surfaced by VS Code as `mcp_devsteps_devsteps_*`). Recommendation: rename the 6 doc-feature tools to drop the prefix, contingent on STORY-245 / TASK-444 strategic decision. Implements: TASK-443.