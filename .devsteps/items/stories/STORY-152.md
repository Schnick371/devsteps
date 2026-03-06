## Ziel

Proaktive Konflikterkennung basierend auf affected_paths und Abhängigkeiten.

### Problem

Zwei Items die dieselben Dateien ändern können zu Merge-Konflikten führen. Items die von einem Draft-Item abhängen sind implizit blockiert. Aktuell keine automatische Erkennung.

### Tool: devsteps_conflicts

```
devsteps_conflicts({
  scope: 'sprint' | 'all-active',
  item_id?: string  // prüfe Konflikte für ein bestimmtes Item
})
```

Analysiert:
1. **File-Overlap**: Items mit überlappenden affected_paths
2. **Implicit Blocks**: Items die von draft-Items abhängen
3. **Schema Consumers**: Schema-Changes mit downstream-Consumers
4. **Branch Conflicts**: Parallele Branches die dieselben Dateien ändern

Rückgabe: Risk-ranked Liste von Konflikten mit Empfehlungen.

### Acceptance Criteria

- [ ] File-Overlap Detection korrekt
- [ ] Implicit Block Detection
- [ ] Performance < 500ms für 100 Items
- [ ] Risk-Ranking (high/medium/low)