## Goal

Clearly document that T1 Sprint Executor calls `write_sprint_brief` after the initial archaeology batch — NOT T2 Planner.

## Changes

### 1. `devsteps-t1-sprint-executor.agent.md`

Add new **Step 2.5: Write Enriched Sprint Brief** after "Step 2: Global Archaeology Batch":

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

Extend "Pre-MAP: Read Existing MandateResults":

```markdown
### Step 0: Read Enriched Sprint Brief (if available)
- Check `.devsteps/analysis/sprint-[DATE]/enriched-sprint-brief.json`
- If present: use `ordered_items` + risk scores as primary decomposition guide
- If absent: proceed with raw MandateResults only (single-item mode)
```

### 3. `packages/mcp-server/src/tools/analysis.ts`

Correct `write_sprint_brief` description:
```
// Before: "produced by devsteps-planner at sprint start"
// After:  "produced by T1 Sprint Executor after initial archaeology batch"
```

### 4. `TIER2-PROTOCOL.md`

Correct sprint brief reference:
> "T1 Sprint Executor writes sprint brief after archaeology; T2 Planner reads it — not the other way around."

## Acceptance Criteria
- [ ] All 4 files are consistent: T1 Sprint Executor = owner of the sprint brief
- [ ] T2 Planner reads sprint brief (if present) as primary input
- [ ] `write_sprint_brief` tool description is correct
- [ ] No document still says "devsteps-planner" as the author