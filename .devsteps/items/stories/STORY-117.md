## Problem

**Escalation ist eine One-Way-Strasse.**

`write_escalation` (MCP) schreibt eine Escalation nach `.devsteps/cbp/[sprint_id]/escalations/`. Aber es gibt kein `read_escalations` Tool. Nach einem Session-Neustart oder wenn T1 zwischen zwei Phasen pausiert, kann er nicht abfragen welche Escalations noch offen sind.

**Konsequenz:** T1 schreibt eine Escalation, User gibt Antwort, nächste Session startet → T1 "vergisst" die offene Escalation und führt die blockierte Phase einfach fort. Das verletzt die Grundgarantie: *"Never silently continue after writing an escalation."*

## Goal

`read_escalations` MCP-Tool das offene, beantwortete und alle Escalations eines Sprints abruft. T1 prüft damit am Session-Start ob ausstehende Entscheidungen vorliegen.

## Acceptance Criteria

- [ ] `read_escalations` Tool definiert in `packages/mcp-server/src/tools/cbp.ts`
- [ ] Parameter: `sprint_id` (required), `status_filter: 'open'|'resolved'|'all'` (default: `'open'`)
- [ ] Liest alle `[escalation_id].json` aus `.devsteps/cbp/[sprint_id]/escalations/`
- [ ] Returniert: `{ escalations: EscalationRecord[], pending_count: number }`
- [ ] T1 Coordinator + Sprint Executor Agent-Dateien aktualisiert: **Session-Start-Check** `read_escalations({ sprint_id, status_filter: 'open' })` → bei `pending_count > 0` Escalation dem User melden vor jeder Aktion
- [ ] Mechanismus, um Escalations als `resolved` zu markieren: entweder via `resolve_escalation` (eigenes Tool) oder Update-Feld in `write_escalation` Schema

## Updated T1 Session-Start Protocol

```
1. devsteps/list — Backlog
2. read_escalations(sprint_id, 'open') ← NEU
   → pending_count > 0 → PAUSE, User entscheiden lassen
3. read_mandate_results(item_ids)
4. Phase A: T2 Dispatch
```

## Agent Documentation Changes

- `devsteps-t1-coordinator.agent.md`: Session-Start-Check ergänzen  
- `devsteps-t1-sprint-executor.agent.md`: Pre-Sprint-Check ergänzen unter "Step 0: Pending Escalations"