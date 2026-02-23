# DevSteps Agent Registry

## Tier Architecture

| Tier | Role | Files |
|---|---|---|
| **T1 — Coordinator** | Single-item MPD dispatcher | `devsteps-t1-coordinator.agent.md` |
| **T1 — Sprint** | Multi-item sprint dispatcher | `devsteps-t1-sprint-executor.agent.md` |
| **T2 — Analysts** | Domain synthesis, mandate handlers | `devsteps-t2-*.agent.md` |
| **T3 — Sub-agents** | Focused aspect readers (leaf nodes) | `devsteps-t3-aspect-*.agent.md`, `devsteps-t3-analyst-*.agent.md` |
| **T2 Exec — Conductors** | Execution orchestration (impl/test/doc) | `devsteps-t2-impl.agent.md`, `devsteps-t2-test.agent.md`, `devsteps-t2-doc.agent.md` |
| **T3 Exec — Workers** | Leaf-node code/test/doc writers (dispatched by T2 Exec only) | `devsteps-t3-impl.agent.md`, `devsteps-t3-test.agent.md`, `devsteps-t3-doc.agent.md` |

> All agent files contain a `## Contract` section identifying their tier, dispatcher, and return type.

---

## T1 → T2 Mandate Routing Table

> **CRITICAL: All mandates in the same row MUST be dispatched simultaneously (one parallel fan-out).**

| Triage Tier | T2 Mandates (Phase A — parallel) | After MandateResults available |
|---|---|---|
| **QUICK** | `t2-planner` | `t2-impl` → `t2-reviewer` |
| **STANDARD** | `t2-archaeology` + `t2-risk` | → `t2-planner` → `t2-impl` → `t2-test` → `t2-reviewer` |
| **FULL** | `t2-archaeology` + `t2-risk` + `t2-quality` | → `t2-planner` → `t2-impl` → `t2-test` ∥ `t2-doc` → `t2-reviewer` |
| **COMPETITIVE** | `t2-research` + `t2-archaeology` | → `t2-planner` → `t2-impl` → `t2-reviewer` |

---

## Mandate Types → T2 Agent Mapping

| mandate-type | T2 Agent | Protocol |
|---|---|---|
| `archaeology` | `devsteps-t2-archaeology` | context + internal T3 fan-out → structural map |
| `risk` | `devsteps-t2-risk` | impact + integration + constraints T3 fan-out → risk matrix |
| `research` | `devsteps-t2-research` | web + internal T3 cross-validation → ranked recommendation |
| `quality` | `devsteps-t2-quality` | automated gates + quality T3 + Review-Fix loop |
| `planning` | `devsteps-t2-planner` | reads existing MandateResults, minimal T3 → ordered steps |
| `planning` | `devsteps-t2-planner` | reads existing MandateResults, minimal T3 → ordered steps |
| `implementation` | `devsteps-t2-impl` | dispatches t3-impl + optional t3-analyst-web → code committed |
| `testing` | `devsteps-t2-test` | dispatches t3-test + optional t3-aspect-quality → tests pass |
| `documentation` | `devsteps-t2-doc` | dispatches t3-doc + optional t3-aspect-staleness → docs updated |
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
> T2 files: `devsteps-t2-*.agent.md` | T3 Sub-agents: `devsteps-t3-aspect-*.agent.md`, `devsteps-t3-analyst-*.agent.md` | T3 Exec Workers: `devsteps-t3-impl/test/doc.agent.md` (dispatched by T2 Exec Conductors only)

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

## T2 Exec — Conductors (dispatched by T1 after t2-planner MandateResult available)

| Agent | Role | Dispatches (T3) |
|---|---|---|
| `devsteps-t2-impl` | Implementation Conductor | `t3-impl` (always) + `t3-analyst-web` (conditional) |
| `devsteps-t2-test` | Test Conductor | `t3-test` (always) + `t3-aspect-quality` + `t3-analyst-web` (conditional) |
| `devsteps-t2-doc` | Documentation Conductor | `t3-doc` (always) + `t3-aspect-staleness` (FULL only) |

T2 Exec Conductors receive **only `report_path` + `item_id`** from T1. They orchestrate their T3 workers and return a MandateResult.

## T3 Exec — Workers (dispatched by T2 Exec Conductors only — T1 NEVER dispatches these)

| Agent | Role | Dispatched by |
|---|---|---|
| `devsteps-t3-impl` | Code writer | `devsteps-t2-impl` |
| `devsteps-t3-test` | Test writer | `devsteps-t2-test` |
| `devsteps-t3-doc` | Documentation writer | `devsteps-t2-doc` |

Exec workers receive **only `report_path` + `item_id`** — never raw findings pasted in prompt.

---

## VS Code Agent Metadata — `agents`, `handoffs`, `user-invokable`

All agent files use VS Code custom agent frontmatter (VS Code 1.106+).

| Field | T1 | T2 (non-reviewer) | T2 Reviewer | T3 |
|---|---|---|---|---|
| `agents:` | ✓ lists T2 deps | ✓ lists T3 deps | ✓ | — |
| `handoffs:` | ✓ workflow buttons | ✓ pipeline buttons | ✓ PASS/FAIL | — |
| `user-invokable: false` | — (always visible) | ✓ (hidden) | — (always visible) | ✓ (hidden) |

### `agents:` — Subagent Dispatch Allowlist

Lists which agents this agent may programmatically dispatch via the `agent` tool.
Requires `agent` in the file's `tools:` list. T1 lists T2 deps; T2 lists T3 deps.

```yaml
agents:
  - devsteps-t2-archaeology
  - devsteps-t2-risk
```

### `handoffs:` — Guided UI Transitions

Buttons rendered after each response to guide the developer through workflow steps.
`send: false` means the user must click Send — the prompt is pre-filled but not auto-sent.
`handoffs.agent` does **not** need to be in `agents:` — handoffs are UI navigation only.

```yaml
handoffs:
  - label: "Phase A: Archaeology"
    agent: devsteps-t2-archaeology
    prompt: "Archaeology mandate for item: [PASTE_ITEM_ID]."
    send: false
```

### `user-invokable: false` — Subagent-Only Visibility

Hides the agent from the VS Code agent picker dropdown.
Set on all T2 analysts (except reviewer) and all T3 agents — they are only
accessible when dispatched programmatically by their parent tier agent.

---

*Protocol details: [TIER2-PROTOCOL.md](./TIER2-PROTOCOL.md)*  
*Agent files: `.github/agents/devsteps-t2-*.agent.md`*
