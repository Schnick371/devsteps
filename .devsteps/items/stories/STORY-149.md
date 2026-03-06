## Ziel

Composite-Tool zum Aufteilen eines zu großen Items in mehrere Sub-Items.

### Problem

"Dieser Task ist größer als erwartet — ich muss TASK-042 in TASK-042a und TASK-042b aufteilen." Aktuell: 2 neue Tasks erstellen, linken, alten Task updaten, Parent re-linken — 8+ Tool-Calls.

### Tool: devsteps_split

```
devsteps_split({
  item_id: 'TASK-042',
  children: [
    { title: 'Auth Middleware', description: '...' },
    { title: 'Token Validation', description: '...' }
  ]
})
```

- Erstellt Kind-Items unter dem gleichen Parent
- Links `implements` zum Original-Parent
- Original-Item Status → `superseded-by` die neuen Items
- Preserviert: Tags, Priority, affected_paths

### Acceptance Criteria

- [ ] Ein Tool-Call statt 8+
- [ ] Korrekte Link-Hierarchie
- [ ] Original-Item korrekt superseded
- [ ] Tags/Priority vererbt