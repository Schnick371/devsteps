# DevSteps Agent Registry

## Tier Architecture

| Tier | Role | Files |
|---|---|---|
| **T1 — Coordinator** | Single-item MPD dispatcher | `devsteps-t1-coordinator.agent.md` |
| **T1 — Sprint** | Multi-item sprint dispatcher | `devsteps-t1-sprint-executor.agent.md` |
| **T2 — Analysts** | Domain synthesis, mandate handlers | `devsteps-t2-*.agent.md` |
| **T3 — Sub-agents** | Focused aspect readers (leaf nodes) | `devsteps-t3-aspect-*.agent.md`, `devsteps-t3-analyst-*.agent.md` |
| **T3 Exec — Workers** | Code/test/doc implementation | `devsteps-t3-impl.agent.md`, `devsteps-t3-test.agent.md`, `devsteps-t3-doc.agent.md` |

> All agent files contain a `## Contract` section identifying their tier, dispatcher, and return type.

---

## T1 → T2 Mandate Routing Table

> **CRITICAL: All mandates in the same row MUST be dispatched simultaneously (one parallel fan-out).**

| Triage Tier | T2 Mandates (Phase A — parallel) | After MandateResults available |
|---|---|---|
| **QUICK** | `t2-planner` | `t3-impl` → `t2-reviewer` |
| **STANDARD** | `t2-archaeology` + `t2-risk` | → `t2-planner` → `t3-impl` + `t3-test` (parallel) → `t2-reviewer` |
| **FULL** | `t2-archaeology` + `t2-risk` + `t2-quality` | → `t2-planner` → `t3-impl` + `t3-test` + `t3-doc` (parallel) → `t2-reviewer` |
| **COMPETITIVE** | `t2-research` + `t2-archaeology` | → `t2-planner` → `t3-impl` → `t2-reviewer` |

---

## Mandate Types → T2 Agent Mapping

| mandate-type | T2 Agent | Protocol |
|---|---|---|
| `archaeology` | `devsteps-t2-archaeology` | context + internal T3 fan-out → structural map |
| `risk` | `devsteps-t2-risk` | impact + integration + constraints T3 fan-out → risk matrix |
| `research` | `devsteps-t2-research` | web + internal T3 cross-validation → ranked recommendation |
| `quality` | `devsteps-t2-quality` | automated gates + quality T3 + Review-Fix loop |
| `planning` | `devsteps-t2-planner` | reads existing MandateResults, minimal T3 → ordered steps |
| `review` | `devsteps-t2-reviewer` | Blocking quality gate — PASS/FAIL, write_rejection_feedback, escalation |

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

> Each file contains a `## Contract` section that identifies its tier, who dispatches it, and what it returns.
> T2 files: `devsteps-t2-*.agent.md` | T3 Sub-agents: `devsteps-t3-aspect-*.agent.md`, `devsteps-t3-analyst-*.agent.md` | T3 Exec: `devsteps-t3-impl/test/doc.agent.md`

| Agent | Domain |
|---|---|
| `devsteps-t3-aspect-impact` | Call-site blast radius |
| `devsteps-t3-aspect-constraints` | Hard constraints, schema, contract risks |
| `devsteps-t3-aspect-quality` | Test gaps, pattern consistency |
| `devsteps-t3-aspect-staleness` | Stale docs, conflicting active branches |
| `devsteps-t3-aspect-integration` | Cross-package boundaries |
| `devsteps-t3-analyst-context` | Global project map, tree walking |
| `devsteps-t3-analyst-internal` | Deep file reads, symbol tracing |
| `devsteps-t3-analyst-web` | External best practices, deprecation signals |

---

## T3 Exec — Executive Agents (dispatched by T1 directly after planning MandateResult available)

| Agent | Role | Input from |
|---|---|---|
| `devsteps-t3-impl` | Code implementation | `t2-planner` MandateResult `report_path` + item ID |
| `devsteps-t3-test` | Test implementation | `t2-planner` + `t2-quality` MandateResult `report_path` |
| `devsteps-t3-doc` | Documentation | `t2-quality` MandateResult `report_path` |

Exec agents receive **only `report_path` + `item_id`** — never raw findings pasted in prompt.

---

*Protocol details: [TIER2-PROTOCOL.md](./TIER2-PROTOCOL.md)*  
*Agent files: `.github/agents/devsteps-t2-*.agent.md`*
