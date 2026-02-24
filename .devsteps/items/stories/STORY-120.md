## Problem

All 26 MCP tool names lack an explicit `devsteps_` namespace prefix. Generic names like `add`, `list`, `update`, `health` risk conflicts with other MCP servers and reduce discoverability.

## Solution

Prefix every `name` field in each tool definition with `devsteps_`.

## Tool Inventory (26 tools)

| File | Current → Target |
|------|-----------------|
| `tools/crud.ts` | `init` → `devsteps_init`, `add` → `devsteps_add`, `get` → `devsteps_get`, `list` → `devsteps_list`, `update` → `devsteps_update` |
| `tools/relationships.ts` | `link` → `devsteps_link`, `unlink` → `devsteps_unlink`, `trace` → `devsteps_trace` |
| `tools/system.ts` | `search` → `devsteps_search`, `status` → `devsteps_status`, `export` → `devsteps_export`, `archive` → `devsteps_archive`, `purge` → `devsteps_purge`, `context` → `devsteps_context`, `health` → `devsteps_health`, `metrics` → `devsteps_metrics`, `update_copilot_files` → `devsteps_update_copilot_files` |
| `tools/analysis.ts` | `write_analysis_report` → `devsteps_write_analysis_report`, `read_analysis_envelope` → `devsteps_read_analysis_envelope`, `write_verdict` → `devsteps_write_verdict`, `write_sprint_brief` → `devsteps_write_sprint_brief` |
| `tools/cbp.ts` | `write_mandate_result` → `devsteps_write_mandate_result`, `read_mandate_results` → `devsteps_read_mandate_results`, `write_rejection_feedback` → `devsteps_write_rejection_feedback`, `write_iteration_signal` → `devsteps_write_iteration_signal`, `write_escalation` → `devsteps_write_escalation` |

## Acceptance Criteria

- [ ] All 26 tool `name` fields in the 5 tool definition files carry the `devsteps_` prefix
- [ ] Server routing continues to work (server.ts uses `tool.name` dynamically, no manual changes needed)
- [ ] Agent/instruction files referencing tool names are updated
- [ ] Build passes (`npm run build`)
- [ ] BATS integration tests pass
- [ ] CHANGELOG updated (breaking change)