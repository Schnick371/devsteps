## Überblick

Session-Lifecycle-Management für DevSteps — die Antwort auf "Was machen wir gerade?" und "Was haben wir zuletzt gemacht?"

### Kernproblem

Wenn eine neue Copilot-Session startet (neuer Chat, neuer Tag, Kontextverlust), muss die KI sofort wissen:
1. Was war das letzte, woran wir gearbeitet haben?
2. Was ist der Status aller in-progress Items?
3. Gibt es blockierte Items die Aufmerksamkeit brauchen?
4. Welche Dateien haben sich seit der letzten Session geändert?
5. Welche Entscheidungen/Konventionen sind relevant für die aktuelle Arbeit?

### Session-Lifecycle

`none → ACTIVE → PAUSED → ARCHIVED`
- `start_session(resume_from?)` — Erstellt Session, lädt Kontext, berechnet Diff
- `end_session(summary?)` — Generiert Auto-Log-Entry, archiviert Session
- `pause_session()` — Snapshot des aktuellen States für späteren Resume
- `get_active_session()` — "Was machen wir gerade?" → Aktiver State oder "Nichts"
- `update_session()` — Fokus-Items, Entscheidungen, offene Fragen aktualisieren

### Active Work Cursor (Middleware)

Automatisches Tracking via Server-Middleware: Jeder MCP-Tool-Call aktualisiert implizit die Session:
- `update(TASK-042, status: in-progress)` → Auto-add zu focus_items
- `update(TASK-042, status: done)` → Move zu completed_items
- `add(type: bug)` → Increment items_created, add zu discovered_items

### Resume Protocol

1. Lade vorherige Session
2. Berechne Diff (Git-Änderungen, neue Items, Status-Changes)
3. Generiere Briefing (~200 Tokens)
4. Erstelle neue Session mit carry-over State

### Storage

`.devsteps/sessions/{active,paused,archived/YYYY-MM/}`

### Forschungsgrundlage

- Context Savvy MCP: Session context save/restore
- Claude Code Guide: "What was I working on?" pattern
- Amazon Bedrock + Mem0: Memory-powered session resume
- Session Log Revolution (Medium): Structured documentation for AI dev