## Ziel

Resume-Protokoll das bei Session-Start automatisch einen Briefing-Text generiert.

### Resume Protocol

1. Lade vorherige Session (paused/archived)
2. Compute Diff: Git-Changes seit session.paused_at, Item-Status-Änderungen, neue Logs
3. Resolve Open Questions: Auto-mark wenn Items/Commits sie adressieren
4. Generate Briefing (~200 Tokens): Focus-Items, letzte Aktion, Änderungen seit Pause, offene Fragen

### Context Integration

Erweitere `devsteps_context(standard)` um `session_state` Feld:
```
session_state: {
  has_active: boolean,
  active_session_id?: string,
  active_focus?: string[],
  paused_count: number,
  last_session_ago?: string
}
```

### Acceptance Criteria

- [ ] Briefing in <500ms generiert
- [ ] Git-Diff korrekt berechnet (simple-git)
- [ ] Item-Status-Diff aus Index
- [ ] Context-Integration im Standard-Level