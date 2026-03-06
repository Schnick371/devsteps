## Ziel

Lightweight Middleware im MCP-Server die nach jedem erfolgreichen Tool-Call den Session-State automatisch aktualisiert.

### Cursor-Updates

| MCP Tool Call | Session Effect |
|---|---|
| `update(id, status: "in-progress")` | Auto-add zu focus_items |
| `update(id, status: "done")` | Move zu completed_items |
| `add(type: "bug")` | Increment items_created, add zu discovered_items |
| `get(id)` | Add affected_paths zu files_touched |
| Any tool call | Increment tool_calls, update last_tool_call |

### Implementation

~20 Zeilen Middleware in server.ts, wrapping CallToolRequestSchema handler. Fire-and-forget (non-blocking) Session-Datei-Update.

### Acceptance Criteria

- [ ] Middleware fängt alle Tool-Calls ab
- [ ] Non-blocking: Session-Update blockt nie den Tool-Response
- [ ] Graceful degradation wenn keine aktive Session
- [ ] Kein Performance-Impact auf Tool-Calls (<5ms Overhead)