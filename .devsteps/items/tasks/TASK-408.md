Add two MCP tools:

`devsteps_docs_classify_confirm`:
- Input: `{ path, decision: 'accept'|'split'|'skip'|'rewrite', diataxis_type?, splits?, session_id, token }`
- Appends to session.classified[] with read-modify-write + conflict detection
- Returns: pending_count, classified_count, next_steps
- SECURITY: validate splits[].new_path with resolveWithin(workspaceRoot, userPath)

`devsteps_docs_bom_status`:
- Input: `{ session_id, token }`
- Returns: summary table of session state, pending files list