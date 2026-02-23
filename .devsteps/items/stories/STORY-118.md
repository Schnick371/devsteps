## Problem

`write_sprint_brief` ist als MCP-Tool vollständig implementiert, aber **kein Agent-File dokumentiert explizit wer es wann aufruft**. Das Tool-Docstring sagt "produced by devsteps-planner at sprint start" — aber T2-Planner dekomponiert Items, er erstellt keinen Sprint Brief. T1 Sprint Executor macht das Pre-Sprint-Analysis — aber sein Agent-File erwähnt `write_sprint_brief` mit keinem Wort.

**Konsequenz:** `write_sprint_brief` wird in der Praxis nie aufgerufen. Der Enriched Sprint Brief existiert nie. T2-Planner kann nicht auf Risk-Scores und Build-Order zurückgreifen, die er bräuchte.

## Goal

Klare Ownership-Zuweisung und Agent-Dokumentation sodass `write_sprint_brief` zuverlässig am Sprint-Start aufgerufen wird.

## Acceptance Criteria

- [ ] `devsteps-t1-sprint-executor.agent.md` erhält expliziten **"Step 0: Write Sprint Brief"** vor Phase A
- [ ] Step 0 beschreibt: was wird berechnet (Risk-Scores QUICK/STANDARD/FULL/COMPETITIVE, Build-Order, Shared-File Conflict Map), wie T2 Archaeology MandateResults als Input verwendet werden
- [ ] `TIER2-PROTOCOL.md` korrigiert: "produced by T1 Sprint Executor" statt "devsteps-planner"
- [ ] `write_sprint_brief` Tool-Description in `analysis.ts` korrigiert: "Called by T1 Sprint Executor after initial archaeology batch — not T2 Planner"
- [ ] T2 Planner Agent-File ergänzt: "Reads enriched-sprint-brief.json as primary planning input if available"

## Ownership nach Fix

```
T1 Sprint Executor (Pre-Sprint-Analysis)
  Step 0: write_sprint_brief(ordered_items, risk_scores, build_order)
  Step 1: Backlog Discovery
  Step 2: Global Archaeology Batch → T2
    └──▶ T2 Planner reads enriched-sprint-brief.json ← inputs used here
```