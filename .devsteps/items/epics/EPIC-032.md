## Überblick

Dynamisches Plan- und Trail-System für DevSteps, das die Lücke zwischen statischer Aufgabenverwaltung und echtzeitfähiger Ausführungsverfolgung schließt.

### Kernkonzepte

1. **Plan (Blueprint)** — Die GEPLANTE Schrittfolge mit Gap-Nummerierung (10, 20, 30...) zur dynamischen Einfügung
2. **Trail (Ledger)** — Die TATSÄCHLICHE Ausführungshistorie als append-only Event-Log
3. **Dynamic Insertion** — Wenn Schritt 20 fehlschlägt weil ein Prerequisite fehlt, wird Schritt 15 zwischen 10 und 20 eingefügt
4. **15 Plan-Typen** — Implementation, Test, Migration, Deployment, Rollback, Code-Review, Security-Audit, Performance-Benchmark, A11y-Audit, Prerequisite-Discovery, Refactoring, Debug, Spike, Integration, Dep-Upgrade

### Gap-Nummerierung

- Top-Level Steps: 10, 20, 30... (Gap von 10, erlaubt 9 Einfügungen)
- Midpoint-Insertion: `floor((after + before) / 2)` → 15 zwischen 10 und 20
- Sub-Steps: Sequential (10.1, 10.2, 10.3...) — append-only innerhalb eines Parents
- Exhaustion-Handling: Lokales Renumbering mit Aliases-Array für Backward-Referenzen

### MCP Tools (12 geplant)

**Plan CRUD (4):** `create_plan`, `get_plan`, `update_plan_step`, `reorder_plan_steps`
**Step Execution (5):** `start_step`, `complete_step`, `fail_step`, `block_step`, `retry_step`
**Dynamic Insertion (1):** `insert_step`
**Convenience (1):** `block_and_insert` (atomarer Block + Insert)
**Trail Query (1):** `get_trail`

### Storage

- `.devsteps/plans/[item_id]/[plan_type].plan.json`
- `.devsteps/plans/[item_id]/[plan_type].trail.json`

### Forschungsgrundlage

- CTHA Paper (arxiv 2601.10738): Tactical Layer = Episodic Memory, 47% Failure Cascade Reduction
- WBS (Atlassian): Decimal hierarchical decomposition
- Event Sourcing (Kurrent): Append-only immutable event store
- SAP WBS: Gap-numbered element insertion
- AI Planning Pattern (CrewAI/DeepResearch): Decompose → Execute → Replan cycle