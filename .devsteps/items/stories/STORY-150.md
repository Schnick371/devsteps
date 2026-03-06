## Ziel

Konsolidierter Aktivitätsbericht für einen Zeitraum — "Was ist in den letzten 8 Stunden passiert?"

### Problem

Der Mensch muss aktuell git log, devsteps_list und einzelne Item-Dateien lesen um zu verstehen was die KI gemacht hat.

### Tool: devsteps_digest

```
devsteps_digest({
  since: 'ISO-timestamp' | '8h' | '1d' | 'last_session',
  include_git: true,
  include_decisions: true,
  include_questions: true,
  format: 'markdown' | 'brief'
})
```

Generiert:
- Items erstellt/aktualisiert/abgeschlossen
- Commits gemacht (mit Commit-Messages)
- Entscheidungen getroffen (wenn ADR-System vorhanden)
- Bugs geflaggt, Debt-Marker gesetzt
- Dateien geändert
- Offene Fragen für den Menschen

### Acceptance Criteria

- [ ] Markdown und Brief Format
- [ ] Git-History korrekt eingebunden
- [ ] Zeitfilter funktioniert (absolute + relative)
- [ ] Digest < 500 Tokens für "brief" Format