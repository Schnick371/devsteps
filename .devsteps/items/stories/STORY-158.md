## Ziel

Zwei MEDIUM-Priority Features konsolidiert:

### Tool 1: devsteps_batch (Batch Operations)

```
devsteps_batch({
  operations: [
    { action: 'update', item_id: 'TASK-042', status: 'done' },
    { action: 'update', item_id: 'TASK-043', status: 'done' },
    { action: 'link', source: 'TASK-044', target: 'STORY-010', type: 'implements' }
  ]
})
```

- Reduziert Tool-Call-Count für Bulk-Operationen
- Atomisch: Entweder alle oder keine
- Hauptanwendung: Sprint-Ende-Cleanup, Status-Updates

### Tool 2: devsteps_evidence (Test Evidence Recording)

```
devsteps_evidence({
  item_id: 'TASK-042',
  type: 'test_result' | 'screenshot' | 'log' | 'metric',
  description: 'All 47 unit tests passing',
  data?: { passed: 47, failed: 0, coverage: 0.92 },
  artifact_path?: 'coverage/lcov.info'
})
```

- Beweis-Aufzeichnung für Review-Phase
- Reviewer kann objektiv prüfen ob Tests laufen
- Integration mit devsteps_verify (Acceptance Criteria)

### Storage

- Evidence inline im Item (metadata.evidence[])

### Acceptance Criteria

- [ ] Batch: Atomische Ausführung
- [ ] Batch: Rollback bei Fehler
- [ ] Evidence: Verschiedene Typen
- [ ] Evidence: Reviewer-Integration