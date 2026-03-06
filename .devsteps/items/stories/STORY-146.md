## Ziel

5 MCP-Tools für das Knowledge-System.

### Tools

1. **devsteps_write_knowledge** — Neues Knowledge-Eintrag erstellen (ADR, Convention, oder Entry). Auto-ID Generierung. Input: kind (adr/convention/entry), data (passendes Schema)
2. **devsteps_update_knowledge** — Bestehenden Eintrag aktualisieren (Status ändern, Content verfeinern, Supersede). Input: id (ADR-001/CONV-003/KNOW-012), updates (partial), reason
3. **devsteps_query_knowledge** — Suche in der Knowledge-Base. Filter: kind, type, status, tags[] (AND), path (glob), query (Freitext). Limit. Sortiert nach Relevanz
4. **devsteps_get_relevant_knowledge** — Kontext-basierte Abfrage: welche Knowledge-Einträge sind relevant für bestimmte Dateien, Items oder Packages? Auto-surfacing von Conventions, ADRs, Anti-Patterns. Input: files[], item_id?, package?
5. **devsteps_list_knowledge** — Lightweight Index: IDs, Titel, Typen, Status. Kein Content. Für Dashboard/Übersicht

### Integration

- `devsteps_context(standard)` integriert knowledge_summary (total ADRs/Conventions/Entries, last_updated)
- get_relevant_knowledge nutzt `affected_paths` und `applies_to` für Scope-Matching

### Acceptance Criteria

- [ ] Alle 5 Tools registriert und funktional
- [ ] write_knowledge validiert gegen passendes Schema
- [ ] query_knowledge: Freitext + Filter kombinierbar
- [ ] get_relevant_knowledge: Glob-Matching für applies_to
- [ ] Atomare Writes für alle Schreiboperationen