## Goal

Eindeutig dokumentieren dass T1 Sprint Executor `write_sprint_brief` nach der initialen Archaeology Batch aufruft — NICHT T2 Planner.

## Changes

### 1. `devsteps-t1-sprint-executor.agent.md`

Neuer **Step 0.5: Write Sprint Brief** nach "Step 2: Global Archaeology Batch":

```markdown
### Step 2.5: Write Enriched Sprint Brief (after Archaeology MandateResults available)

After reading Archaeology MandateResults via `read_mandate_results`:
1. Compute risk scores per item: QUICK | STANDARD | FULL | COMPETITIVE
2. Determine build order (dependency graph from linked_items)
3. Identify shared-file conflicts (multiple items touching same files)
4. Call `write_sprint_brief(sprint_date, { ordered_items, global_context_path })`

This brief persists to disk and T2 Planner reads it as primary input.
```

### 2. `devsteps-t2-planner.agent.md`

"Pre-MAP: Read Existing MandateResults" ergänzen:

```markdown
### Step 0: Read Enriched Sprint Brief (if available)
- Check `.devsteps/analysis/sprint-[DATE]/enriched-sprint-brief.json`
- If present: use `ordered_items` + risk scores as primary decomposition guide
- If absent: proceed with raw MandateResults only (single-item mode)
```

### 3. `packages/mcp-server/src/tools/analysis.ts`

`write_sprint_brief` description korrigieren:
```
// Vorher: "produced by devsteps-planner at sprint start"  
// Nachher: "produced by T1 Sprint Executor after initial archaeology batch"
```

### 4. `TIER2-PROTOCOL.md`

Sprint Brief reference korrigieren:
> "T1 Sprint Executor writes sprint brief after archaeology; T2 Planner reads it — not the other way around."

## Acceptance Criteria
- [ ] Alle 4 Dateien konsistent: T1 Sprint Executor = Owner des Sprint Briefs
- [ ] T2 Planner liest Sprint Brief (wenn vorhanden) als primären Input
- [ ] `write_sprint_brief` Tool-Description korrekt
- [ ] Kein Dokument sagt noch "devsteps-planner" als Ersteller