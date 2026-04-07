Implement the 5-tool MCP dialog chain for `devsteps docs import`:

1. `devsteps_docs_import` — scan + session init + token generation
2. `devsteps_docs_classify` — ScoreVector heuristic + MIXED detection
3. `devsteps_docs_classify_confirm` — user decision intake (accept/split/skip/rewrite)
4. `devsteps_docs_bom_status` — session progress
5. `devsteps_docs_bom_commit` — DOC Items + DocsMapDocument update
+ `devsteps_docs_new` — creation-time enforcement (guided type selection)

Architecture: server-directed via next_steps[] + token enforcement (HMAC-SHA256).
Session state: `.devsteps/import-sessions/<session_id>.json`

Full design: `tmp/SPIKE-044-MCPDialog-Research-Brief.md`

Gate implementation notes (must be addressed):
- token_hash NOT stored in session file (re-derived on every call)
- Output path traversal guard: `resolveWithin(workspaceRoot, userPath)` for splits[].new_path + devsteps_docs_new stub
- heuristicClassify signature: `(excerpt: string, filepath?: string): ScoreVector`
- Concurrent classify: read-modify-write + conflict detection on session.classified[]
- Slug sanitization: lowercase, hyphens, strip specials## Done
- 6 MCP tools: devsteps_docs_import, _classify, _classify_confirm, _bom_status, _bom_commit, _docs_new
- HMAC-SHA256 session token enforcement in shared/import-session.ts
- Server-directed dialog via next_steps[] guidance
- Path traversal guards, idempotency, session expiry
- 19 unit tests for session management
- Commit: 82f7e89