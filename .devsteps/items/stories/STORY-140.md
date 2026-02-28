## Ziel

Zod-Schemas für das Session-System.

### Schemas

1. **SessionStatus** — Enum: active, paused, archived
2. **GitSnapshot** — branch, uncommitted_changes, last_commit_hash/message/at
3. **DiscoveredItem** — type (bug/task/spike), title, related_to, created_item_id, discovered_at
4. **OpenQuestion** — question, context, asked_at, resolved
5. **FocusItem** — item_id, status_at_start, current_status, files_touched[], started_at, completed_at
6. **SessionState** — session_id (ses-YYYY-MM-DD-6hex), status, started_at, paused_at, ended_at, resumed_from, session_type (planning/implementation/review/bugfix/research/sprint/mixed), focus_items[], completed_items[], tool_calls, items_created/updated, commits_made, git_state, open_questions[], discovered_items[], decisions[], last_tool_call, briefing

### Session ID Format

`ses-YYYY-MM-DD-<6 hex chars>` — sortierbar nach Datum, konsistent mit Log-Entry-IDs

### Acceptance Criteria

- [ ] Alle Schemas validieren korrekt
- [ ] Session ID Generator Utility
- [ ] Export über shared/index.ts