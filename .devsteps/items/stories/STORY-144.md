## Ziel

Automatische Log-Entry-Generierung wenn eine Session beendet wird.

### Algorithmus

1. Klassifiziere Session-Typ
2. Extrahiere items_worked (Dedupe focus_items + completed_items)
3. Synthetisiere decisions[] aus Session-State
4. Sammle open_threads[] (unresolved questions + unfiled discoveries)
5. Generiere observations (~300 Tokens Template)
6. Rufe write_log_entry() auf

### Dependency

Benötigt STORY-133 (write_log_entry MCP-Tool) aus EPIC-031.
Bis dahin: end_session funktioniert mit skip_log=true.

### Acceptance Criteria

- [ ] Auto-Log korrekt aus Session-State projiziert
- [ ] Graceful wenn STORY-133 nicht implementiert (skip_log)
- [ ] Log-Entry enthält alle relevanten Session-Daten
- [ ] Token-Budget: Log ~300 Tokens, nicht mehr