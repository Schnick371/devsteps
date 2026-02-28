## Ziel

Bewusstes Technical-Debt-Tracking mit Datei-Lokation und Severity.

### Problem

"Wir nehmen hier bewusst eine Abkürzung — wie tracken wir das?" Aktuell müsste man einen separaten Task/Bug erstellen.

### Tool: devsteps_debt

```
devsteps_debt({
  action: 'add' | 'list' | 'resolve',
  // add:
  item_id?: 'TASK-042',
  file: 'packages/shared/src/utils/validation.ts',
  line?: 42,
  description: 'Hardcoded timeout, should be configurable',
  severity: 'low' | 'medium' | 'high',
  rationale: 'Time pressure, will fix in next sprint',
  // resolve:
  debt_id?: 'DEBT-007',
  resolution_item?: 'TASK-099'
})
```

### Storage

`.devsteps/debt/DEBT-{NNN}.json`

### Integration

- `devsteps_status` zeigt Debt-Count
- Threshold-Warning wenn Debt>N
- Auto-generate Bug items für "resolve" Phase

### Acceptance Criteria

- [ ] Add/List/Resolve Aktionen
- [ ] Dateiposition trackbar
- [ ] Status-Integration
- [ ] Threshold-Warnung konfigurierbar