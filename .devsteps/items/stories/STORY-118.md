## Problem

`write_sprint_brief` is fully implemented as an MCP tool, but **no agent file explicitly documents who calls it and when**. The tool docstring says "produced by devsteps-planner at sprint start" — but T2 Planner decomposes items; it does not create a sprint brief. T1 Sprint Executor performs the pre-sprint analysis — but its agent file does not mention `write_sprint_brief` at all.

**Consequence:** `write_sprint_brief` is never called in practice. The enriched sprint brief never exists. T2 Planner cannot use the risk scores and build order it needs.

## Goal

Clear ownership assignment and agent documentation so that `write_sprint_brief` is reliably called at sprint start.

## Acceptance Criteria

- [ ] `devsteps-t1-sprint-executor.agent.md` receives an explicit **"Step 0: Write Sprint Brief"** before Phase A
- [ ] Step 0 describes: what is calculated (risk scores QUICK/STANDARD/FULL/COMPETITIVE, build order, shared-file conflict map) and how T2 Archaeology MandateResults are used as input
- [ ] `TIER2-PROTOCOL.md` corrected: "produced by T1 Sprint Executor" instead of "devsteps-planner"
- [ ] `write_sprint_brief` tool description in `analysis.ts` corrected: "Called by T1 Sprint Executor after initial archaeology batch — not T2 Planner"
- [ ] T2 Planner agent file updated: "Reads enriched-sprint-brief.json as primary planning input if available"

## Ownership After Fix

```
T1 Sprint Executor (Pre-Sprint Analysis)
  Step 0: write_sprint_brief(ordered_items, risk_scores, build_order)
  Step 1: Backlog Discovery
  Step 2: Global Archaeology Batch → T2
    └──▶ T2 Planner reads enriched-sprint-brief.json ← input used here
```