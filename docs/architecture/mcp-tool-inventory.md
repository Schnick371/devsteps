# MCP Tool Inventory — DevSteps Server

**Status:** Reference  
**Date:** 2026-05-11  
**Generated for:** TASK-443  
**Scope:** All `tool.registerTool(...)` calls in `packages/mcp-server/src/tools/`

---

## Naming patterns currently in use

The server registers tools under **two patterns**, which interact with the VS Code MCP namespace prefix differently:

| Pattern | Count | Example registered name | Example surfaced as in Copilot tools list |
| ------- | ----- | ----------------------- | ----------------------------------------- |
| Bare    | 28    | `add`                   | `mcp_devsteps_add`                        |
| `devsteps_`-prefixed | 6 | `devsteps_docs_import` | `mcp_devsteps_devsteps_docs_import` ⚠ double prefix |

The double-prefix tools were introduced together with the docs-import feature (STORY-236) before the VS Code surface naming convention was settled. They surface as `mcp_devsteps_devsteps_*` in the Copilot tool selector — visually noisy and a source of confusion.

## Full inventory

### CRUD on items (8)
- `add`, `update`, `get`, `list`, `search`, `link`, `unlink`, `archive`

### Project lifecycle (4)
- `init`, `export`, `status`, `purge`

### Traceability + ops (5)
- `trace`, `context`, `health`, `metrics`, `update_copilot_files`

### Analyst / aspect surfaces (8)
- `write_analysis_report`, `read_analysis_envelope`
- `write_mandate_result`, `read_mandate_results`
- `write_sprint_brief`, `write_verdict`
- `write_rejection_feedback`, `write_iteration_signal`

### Escalation + dispatch (3)
- `write_escalation`, `write_dispatch_manifest`, `patch_dispatch_manifest`

### Documentation feature (6 — `devsteps_`-prefixed)
- `devsteps_doc_read_content`
- `devsteps_docs_import`
- `devsteps_docs_classify`
- `devsteps_docs_classify_confirm`
- `devsteps_docs_bom_status`
- `devsteps_docs_bom_commit`

## Recommended convention

Going forward, **register all tools with bare names**. The MCP server is already namespaced as `devsteps` at the connection layer, so VS Code Copilot prepends `mcp_devsteps_` automatically. A second `devsteps_` prefix on the registered name is redundant.

The 6 doc-feature tools should be renamed in a follow-up:

| Current | Future |
| ------- | ------ |
| `devsteps_doc_read_content` | `doc_read_content` |
| `devsteps_docs_import` | `docs_import` |
| `devsteps_docs_classify` | `docs_classify` |
| `devsteps_docs_classify_confirm` | `docs_classify_confirm` |
| `devsteps_docs_bom_status` | `docs_bom_status` |
| `devsteps_docs_bom_commit` | `docs_bom_commit` |

**Status of the rename:** Blocked on STORY-245 — the rename is a breaking change for any direct MCP client and should be coordinated with the VS Code / Copilot / MCP SEP outcomes tracked under TASK-444.
