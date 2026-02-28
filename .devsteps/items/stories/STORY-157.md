## Ziel

Zwei MEDIUM-Priority Features konsolidiert:

### Tool 1: devsteps_track_effort (Velocity/Effort Tracking)

```
devsteps_track_effort({
  item_id: 'TASK-042',
  action: 'start' | 'pause' | 'complete',
  estimate?: '2h' | '1d',
  actual?: '3h'
})
```

- Automatische Zeiterfassung zwischen start/complete
- Velocity = Σ(completed story points) / Sprint-Dauer
- Burndown-Daten für Sprint-Reports

### Tool 2: devsteps_notes (Human Context Injection)

```
devsteps_notes({
  action: 'add' | 'list' | 'get',
  item_id?: string,
  sprint_id?: string,
  content?: string,
  category?: 'context' | 'decision' | 'concern' | 'praise'
})
```

- Mensch kann Kontext einfügen den die KI nutzen soll
- Persistent über Sessions (anders als Chat-Nachrichten)
- In Session-Resume als "Human Notes" angezeigt

### Storage

- `.devsteps/effort/` — Effort-Tracking-Daten
- `.devsteps/notes/` — Human-Notes

### Acceptance Criteria

- [ ] Effort start/pause/complete Lifecycle
- [ ] Velocity-Berechnung korrekt
- [ ] Notes persistent und per-Item filterbar
- [ ] Session-Resume liest Notes