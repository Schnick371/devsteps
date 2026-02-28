## Ziel

Zwei komplementäre Tools: Blockierte Items sichtbar machen + Datei-Änderungen seit letzter Session.

### Tool 1: devsteps_surface (Blocked-Item Surfacing)

```
devsteps_surface({ scope: 'sprint' | 'all' })
```

Findet:
- Items mit `blocked-by` Links zu unerledigten Items
- Items mit `depends-on` zu draft-Items
- Items deren `affected_paths` von einem in-progress Item bearbeitet werden
- Implizit blockierte Items (Transitivität über Link-Graph)

### Tool 2: devsteps_diff (File Change Delta)

```
devsteps_diff({
  since: 'last_session' | 'ISO-timestamp' | 'HEAD~5',
  item_id?: string,
  format: 'summary' | 'detailed'
})
```

Zeigt:
- Geänderte Dateien gruppiert nach Item/Commit
- Neue vs. modifizierte vs. gelöschte Dateien
- Impact-Abschätzung (welche Items sind von den Änderungen betroffen?)

### Acceptance Criteria

- [ ] Transitive Blockade-Erkennung
- [ ] Git-Integration für File-Delta
- [ ] Performance < 500ms
- [ ] Impact-Mapping korrekt