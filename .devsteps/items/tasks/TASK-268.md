## What to Change

In each tool definition file, update every `name:` field to add the `devsteps_` prefix.

### crud.ts
- `'init'` → `'devsteps_init'`
- `'add'` → `'devsteps_add'`
- `'get'` → `'devsteps_get'`
- `'list'` → `'devsteps_list'`
- `'update'` → `'devsteps_update'`

### relationships.ts
- `'link'` → `'devsteps_link'`
- `'unlink'` → `'devsteps_unlink'`
- `'trace'` → `'devsteps_trace'`

### system.ts
- `'search'` → `'devsteps_search'`
- `'status'` → `'devsteps_status'`
- `'export'` → `'devsteps_export'`
- `'archive'` → `'devsteps_archive'`
- `'purge'` → `'devsteps_purge'`
- `'context'` → `'devsteps_context'`
- `'health'` → `'devsteps_health'`
- `'metrics'` → `'devsteps_metrics'`
- `'update_copilot_files'` → `'devsteps_update_copilot_files'`

### analysis.ts
- `'write_analysis_report'` → `'devsteps_write_analysis_report'`
- `'read_analysis_envelope'` → `'devsteps_read_analysis_envelope'`
- `'write_verdict'` → `'devsteps_write_verdict'`
- `'write_sprint_brief'` → `'devsteps_write_sprint_brief'`

### cbp.ts
- `'write_mandate_result'` → `'devsteps_write_mandate_result'`
- `'read_mandate_results'` → `'devsteps_read_mandate_results'`
- `'write_rejection_feedback'` → `'devsteps_write_rejection_feedback'`
- `'write_iteration_signal'` → `'devsteps_write_iteration_signal'`
- `'write_escalation'` → `'devsteps_write_escalation'`

## Note
`server.ts` routing uses `tool.name` dynamically via `Map` — no changes needed there.