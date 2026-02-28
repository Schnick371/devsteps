## Ziel

5 MCP-Tools für Session-Lifecycle-Management.

### Tools

1. **start_session** — Neue Session starten oder pausierte fortsetzen. Auto-detect session_type aus Branch-Name. Optional: resume_from, session_type, focus_items[]
2. **end_session** — Aktive Session beenden. Auto-generiert Log-Entry aus Session-Aktivität. Optional: summary, skip_log
3. **pause_session** — Aktive Session pausieren, State für späteren Resume speichern. Optional: open_questions[], decisions[]
4. **get_active_session** — "Was machen wir gerade?" Gibt aktive Session mit Focus-Items zurück, oder letzte pausierte wenn nichts aktiv. Lightweight für Session-Start.
5. **update_session** — Append-only Updates: add/remove focus, decisions, open_questions, resolve_questions, discovered_items

### Acceptance Criteria

- [ ] Max 1 aktive Session gleichzeitig
- [ ] start_session findet und suggeriert pausierte Sessions
- [ ] end_session generiert Log-Entry (wenn skip_log=false und STORY-133 implementiert)
- [ ] get_active_session < 100ms Response
- [ ] Atomare Writes (.tmp → rename)