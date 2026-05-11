---
diataxis: explanation
related_items: []
status: draft
author: the@devsteps.dev
tags: [handbook, mcp, tools, reference]
---

# DevSteps MCP Tools

This section is the authoritative reference for all `mcp_devsteps_*` tools exposed by the DevSteps MCP server. It covers the full tool palette — CRUD operations, analysis/mandate tools, documentation pipeline tools, and the Spider Web infrastructure tools.

## Contents

| Chapter | Type | Description |
|---------|------|-------------|
| Overview & Tool Capabilities | Explanation | Tool categories, transport, authentication |
| Work Item CRUD Tools | Reference | add, update, list, get, search, trace, link, unlink |
| mcp_devsteps_add — Parameter, Typen, Beispiele | Reference | Full parameter listing with types and examples |
| mcp_devsteps_update — Batch, Append, Tag-Ops | Reference | Partial updates, append_description, tag mutations |
| mcp_devsteps_list / get / search / trace | Reference | Filter syntax, pagination, depth parameters |
| mcp_devsteps_link / unlink | Reference | Relation types, source/target rules |
| Spider Web Analysis Tools | Reference | Mandate and analysis envelope tools |
| write_mandate_result / read_mandate_results | Reference | MandateResult schema, quorum tracking |
| write_analysis_report / read_analysis_envelope | Reference | Analysis envelope format, path conventions |
| write_escalation / write_verdict / write_iteration_signal | Reference | Escalation protocol, verdict states |
| Documentation Pipeline Tools | Reference | Import, classify, BOM commit, assemble |
| devsteps_docs_import | Reference | Session model, path parameter, file scanning |
| devsteps_docs_classify + classify_confirm | Reference | Classification API, decision values, split rules |
| devsteps_docs_bom_commit + bom_status | Reference | Hierarchy parameter, parent_id rules, BOM nodes |
| docs-map.json Schema | Reference | Full field listing, adjacency list format |
| devsteps_docs_assemble | Reference | BOM path, output path, heading normalization |
| How-to: MCP Tools in the doc workflow | How-to | Full documentation sprint with MCP |
| How-to: Build & validate BOM hierarchy | How-to | parent_id rules, level conventions |

## Tool Categories

DevSteps MCP tools are organized into four categories:

1. **CRUD** — Create, read, update, delete work items; manage relationships
2. **Analysis** — Spider Web mandate/envelope write+read tools for agent coordination
3. **Documentation** — Import, classify, BOM management, and assembly pipeline
4. **Infrastructure** — Context loading, health check, metrics, Prometheus endpoint
