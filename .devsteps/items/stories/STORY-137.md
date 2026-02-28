## Ziel

7 MCP-Tools für Step-Ausführung und dynamische Insertion.

### Execution Tools (Trail-emitting)

1. **start_step** — Markiert Step als aktiv, emittiert `step_started` Trail-Event
2. **complete_step** — Markiert Step als fertig mit Outcome, emittiert `step_completed`
3. **fail_step** — Markiert Step als fehlgeschlagen mit Error, emittiert `step_failed`
4. **block_step** — Markiert Step als blockiert wegen fehlendem Prerequisite, emittiert `step_blocked` + `prerequisite_discovered`
5. **retry_step** — Setzt fehlgeschlagenen/blockierten Step zurück auf aktiv, emittiert `step_retried` mit Attempt-Nummer

### Dynamic Insertion

6. **insert_step** — Fügt neuen Step zwischen zwei existierenden ein (Gap-Nummerierung). Emittiert `step_inserted`. Returns: zugewiesene step_number
7. **block_and_insert** — Atomare Kombination: blockiert Step UND fügt Prerequisite-Step davor ein. Convenience für den häufigsten Use-Case

### Trail-Emission

Jeder Tool-Call schreibt append-only in `.devsteps/plans/[item_id]/[plan_type].trail.json`

### Acceptance Criteria

- [ ] Jede Execution emittiert korrektes Trail-Event
- [ ] block_step kann optional auto-insert auslösen
- [ ] insert_step berechnet Midpoint und handhabt Exhaustion
- [ ] retry_step trackt Attempt-Nummer
- [ ] block_and_insert ist atomar (kein Partial State)
- [ ] Trail ist append-only, nie mutiert