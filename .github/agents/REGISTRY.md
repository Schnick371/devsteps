# DevSteps Agent Registry

## Tier Architecture

| Tier | Role | Files |
|---|---|---|
| **T1 — Coordinator** | Single-item MPD dispatcher | `devsteps-coordinator.agent.md` |
| **T1 — Sprint** | Multi-item sprint dispatcher | `devsteps-sprint-executor.agent.md` |
| **T2 — Analysts** | Domain synthesis, mandate handlers | `devsteps-t2-*.agent.md`, `devsteps-reviewer.agent.md` |
| **T3 — Sub-agents** | Focused aspect readers | `devsteps-aspect-*.agent.md`, `devsteps-analyst-*.agent.md` |
| **Exec — Workers** | Code implementation | `devsteps-impl-subagent.agent.md`, `devsteps-test-subagent.agent.md`, `devsteps-doc-subagent.agent.md` |

---

## T1 → T2 Mandate Routing Table

> **CRITICAL: All mandates in the same row MUST be dispatched simultaneously (one parallel fan-out).**

| Triage Tier | T2 Mandates (Phase A — parallel) | After MandateResults available |
|---|---|---|
| **QUICK** | `t2-planner` | impl-subagent → reviewer |
| **STANDARD** | `t2-archaeology` + `t2-risk` | → `t2-planner` → impl + test (parallel) → reviewer |
| **FULL** | `t2-archaeology` + `t2-risk` + `t2-quality` | → `t2-planner` → impl + test + doc (parallel) → reviewer |
| **COMPETITIVE** | `t2-research` + `t2-archaeology` | → `t2-planner` → impl → reviewer |

---

## Mandate Types → T2 Agent Mapping

| mandate-type | T2 Agent | Protocol |
|---|---|---|
| `archaeology` | `devsteps-t2-archaeology` | context + internal T3 fan-out → structural map |
| `risk` | `devsteps-t2-risk` | impact + integration + constraints T3 fan-out → risk matrix |
| `research` | `devsteps-t2-research` | web + internal T3 cross-validation → ranked recommendation |
| `quality` | `devsteps-t2-quality` | automated gates + quality T3 + Review-Fix loop |
| `planning` | `devsteps-t2-planner` | reads existing MandateResults, minimal T3 → ordered steps |
| `review` | `devsteps-reviewer` | T2 quality gate, write_rejection_feedback, escalation |

---

## Communication Contracts

### T1 → T2 dispatch

T1 passes via `agent` tool: `item_ids[]`, `mandate_type`, `sprint_id`, `triage_tier`, optional `constraints`.

### T2 → T1 response (chat — nothing else)

```
report_path: .devsteps/cbp/{sprint_id}/{mandate_id}.result.json
verdict: <domain verdict>
confidence: 0.0–1.0
```

### T1 reading T2 results

T1 calls: `read_mandate_results(item_ids)` — ONLY this, **never `read_analysis_envelope`**.

### T2 reading T3 results

T2 calls: `read_analysis_envelope(report_path)` — internal to T2, invisible to T1.

---

## T3 Sub-Agents (dispatched by T2 only — T1 NEVER dispatches these directly)

| Agent | Domain |
|---|---|
| `devsteps-aspect-impact-subagent` | Call-site blast radius |
| `devsteps-aspect-constraints-subagent` | Hard constraints, schema, contract risks |
| `devsteps-aspect-quality-subagent` | Test gaps, pattern consistency |
| `devsteps-aspect-staleness-subagent` | Stale docs, conflicting active branches |
| `devsteps-aspect-integration-subagent` | Cross-package boundaries |
| `devsteps-analyst-context-subagent` | Global project map, tree walking |
| `devsteps-analyst-internal-subagent` | Deep file reads, symbol tracing |
| `devsteps-analyst-web-subagent` | External best practices, deprecation signals |

---

## Executive Agents (dispatched by T1 directly after planning MandateResult available)

| Agent | Role | Input from |
|---|---|---|
| `devsteps-impl-subagent` | Code implementation | `t2-planner` MandateResult `report_path` + item ID |
| `devsteps-test-subagent` | Test implementation | `t2-planner` + `t2-quality` MandateResult `report_path` |
| `devsteps-doc-subagent` | Documentation | `t2-quality` MandateResult `report_path` |

Exec agents receive **only `report_path` + `item_id`** — never raw findings pasted in prompt.

---

*Protocol details: [TIER2-PROTOCOL.md](./TIER2-PROTOCOL.md)*  
*Agent files: `.github/agents/devsteps-t2-*.agent.md`*
