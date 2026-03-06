## Ziel

Lightweight "Flag and Continue" Tool für Side-Quest-Pattern: Bugs/Tasks entdecken während man an etwas anderem arbeitet, ohne den Flow zu brechen.

### Problem

"Ich implementiere TASK-042 und finde einen Bug in der shared validation layer." Aktuell braucht das: Branch wechseln → devsteps_add → devsteps_link → Branch zurück. 4+ Tool-Calls, fehleranfällig.

### Tool: devsteps_flag

```
devsteps_flag({
  type: 'bug' | 'task' | 'spike',
  title: string,
  description?: string,
  discovered_during: item_id,  // z.B. "TASK-042"
  severity?: 'low' | 'medium' | 'high' | 'critical',
  file?: string,
  line?: number
})
```

- Erstellt Draft-Item mit auto-link `relates-to` zum aktuellen Item
- Funktioniert ohne Branch-Wechsel (Pending-Queue oder direkter Write)
- Returns: neue Item-ID für optionalen TODO-Kommentar im Code

### Acceptance Criteria

- [ ] Ein Tool-Call statt 4+
- [ ] Auto-links zum entdeckenden Item
- [ ] Kein Branch-Wechsel nötig
- [ ] Severity-Feld für Triage