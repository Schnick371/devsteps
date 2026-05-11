**Phase 1 der Ring-Coordinator-Architektur:** R0-coord Triage-Korrekturen, kompatibel mit dem späteren Ring-Coordinator-Modell.

**Pre-req Commit (3 stale files, vor allen anderen Änderungen):**
1. `copilot-instructions.md` L23: "runSubagent does not support nesting — all are Leaf Nodes" → "supported to depth-5 as of VS Code 1.109; current model: depth-2 (coord→conductor→worker)"
2. `AGENT-DISPATCH-PROTOCOL.md` §3 (~L294): Non-coord-exec-Leaf-Node-Assertion → Conductor-Exception hinzufügen
3. `AGENT-DISPATCH-PROTOCOL.md` §4 (~L389): `exec` aus Leaf-Node-Assertion entfernen

**P1 — QUICK-Kriterium:** "whitespace / typo ONLY — no logic, no structure change" (klarer als bisher)
**P2 — FULL quantitatives Trigger:** >300 lines OR >10 files OR packages/shared change → FULL Promotion
**P3 — Pre-Scan bei STANDARD+:** Pre-Scan auch bei STANDARD mit FULL-Promotion wenn >5 files affected
**P4 — Prompt-10 Tier-Promotion:** devsteps-10-plan-work Prompt erhält Tier-Promotion-Block
**P5 — aspect-staleness ins STANDARD Roster:** aspect-staleness zum Standard-Ring-2-Roster hinzufügen

**Constraint:** R0-coord.agent.md ist aktuell bei 149 Zeilen (Limit: 150). Ring-coord-Migration befreit ~11-13 Zeilen → ~134-136 Zeilen nach Änderung.

**Forschungsgrundlage:** MandateResult analysis-research + analysis-archaeology + analysis-risk (Apr 2026)## Research Cycle Completed (2026-04-21)

Gate-reviewer: GO (0.97). 3 deliverables written:
- `tmp/ring-coordinator-architecture-brief.md` — 9-axis brief, RECOMMEND (0.83), 12 sources
- `tmp/story-a-implementation-plan.md` — P1-P5 + stale-fix verbatim, line budget 149→149
- `tmp/adp-spider-web-20-extension-draft.md` — ADP §3/§4 fix + new §5 Ring-Coordinator Protocol

Next: pre-req stale-fix commit (3 files), then P1-P5 impl, then Story B + Story C + SPIKE under EPIC-045.