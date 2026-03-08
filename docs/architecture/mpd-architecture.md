> ⚠️ **SUPERSEDED** — This document describes the original MPD architecture (November 2025). The current agent system uses the **Spider Web (Spinnennetz) Dispatch Protocol** (March 2026+). The core MPD concepts (risk triage, parallel dispatch, review gates) remain valid, but agent names and ring structure have changed. See below for the current architecture.

# Multi-Perspective Dispatch (MPD) Architecture

## Overview

The DevSteps agent system uses **Multi-Perspective Dispatch (MPD)** as its core orchestration pattern. MPD ensures no single analysis perspective creates blind spots by dispatching specialized agents in parallel before synthesis and implementation.

The architecture operates at two layers:

| Layer | Scope | Entry Point |
|---|---|---|
| **Coordinator MPD** | Single work item | `devsteps-coordinator.agent.md` |
| **Sprint Executor MPD** | Entire sprint / session | `devsteps-sprint-executor.agent.md` |

---

## Layer 1 — Coordinator MPD (Single-Item Orchestration)

The coordinator determines a **Risk Tier** for each work item and dispatches agents accordingly.

### Risk Triage

```
QUICK      → isolated change, single-file, full test coverage
STANDARD   → cross-file, shared module references, partial coverage
FULL       → schema change, cross-package, CRITICAL risk label
COMPETITIVE → "which approach/library?" investigation items
```

### Dispatch Matrix

```
QUICK
└── impl-subagent

STANDARD
├── PARALLEL: aspect-impact + aspect-staleness
└── PARALLEL: impl-subagent + test-subagent

FULL
├── PARALLEL (all 5): aspect-impact + aspect-constraints
│                     + aspect-quality + aspect-staleness
│                     + aspect-integration
├── Synthesis → Enriched Task Brief
└── PARALLEL: impl-subagent + test-subagent + doc-subagent

COMPETITIVE
├── PARALLEL: analyst-internal + analyst-web
├── Judge → decision rationale
└── impl-subagent ± planner (if redesign needed)
```

### Review Gate

After each item execution, `devsteps-reviewer` runs as a **blocking gate**:
- **PASS** → merge to main, mark item `done`
- **FAIL** → surface findings to user, do not merge

---

## Layer 2 — Sprint Executor MPD (Multi-Item Orchestration)

### Phase 0 — Pre-flight (runs once per session)

```
PARALLEL:
  analyst-context-subagent  → global codebase archaeology
  aspect-staleness-subagent → obsolescence check (batch all items)

THEN: planner → Enriched Sprint Brief
  - ordered backlog with risk scores
  - conflict map between items
  - sequencing constraints
```

### Phase 1 — Per-Item Execution Loop

```
FOR each item in sprint:
  1. Pull highest priority item from validated backlog
  2. Verify no blockers or conflicts
  3. Triage → Coordinator MPD dispatch
  4. reviewer (BLOCKING gate)
  5. PASS → merge to main | FAIL → surface to user
```

### Phase 2 — Adaptive Replanning (every 5 items or ~2h)

```
PARALLEL:
  analyst-context-subagent (delta) → new changes since last plan
  planner (rerank) → updated priority order
```

---

## Compressed Briefing Protocol (CBP)

The CBP is the signal protocol between agents. It replaces ad-hoc text passing with structured JSON envelopes.

### Signal Flow

```
Aspect Subagent
  └─► write_analysis_report(AnalysisBriefing JSON)
                              │
Coordinator
  ├─◄ read_analysis_envelope (all AnalysisBriefing results)
  ├─── synthesize across all perspectives
  └─► write_verdict(CompressedVerdict JSON)
                       │
Implementation Agents
  └─◄ read_analysis_envelope(CompressedVerdict)
```

### Envelope Types

| Type | Written by | Read by |
|---|---|---|
| `AnalysisBriefing` | Aspect/Analyst agents | Coordinator |
| `CompressedVerdict` | Coordinator | impl / test / doc subagents |

### AnalysisBriefing Fields

```json
{
  "aspect": "impact | constraints | quality | staleness | integration",
  "risk_score": 0-10,
  "findings": [...],
  "blockers": [...],
  "recommendations": [...]
}
```

### CompressedVerdict Fields

```json
{
  "task_id": "TASK-XXX",
  "tier": "QUICK | STANDARD | FULL | COMPETITIVE",
  "risk_score": 0-10,
  "synthesis": "...",
  "implementation_constraints": [...],
  "test_requirements": [...],
  "doc_requirements": [...],
  "go": true | false
}
```

---

## Full Agent Roster (Feb 2026)

### Orchestrators

| Agent | File | Role |
|---|---|---|
| Coordinator | `devsteps-coordinator.agent.md` | Single-item MPD orchestration, triage, synthesis |
| Sprint Executor | `devsteps-sprint-executor.agent.md` | Multi-item sprint orchestration, pre-flight analysis |
| Planner | `devsteps-planner.agent.md` | Strategic sequencing, Enriched Sprint Brief, reranking |

### Analyst Agents

| Agent | File | Role |
|---|---|---|
| Context Analyst | `devsteps-analyst-context-subagent.agent.md` | Global codebase archaeology, dependency mapping |
| Internal Analyst | `devsteps-analyst-internal-subagent.agent.md` | Deep code analysis, API contracts |
| Web Analyst | `devsteps-analyst-web-subagent.agent.md` | External research, library comparison, best practices |

### Aspect Agents (run in parallel during STANDARD/FULL tiers)

| Agent | File | Dimension |
|---|---|---|
| Impact | `devsteps-aspect-impact-subagent.agent.md` | Structural impact, what code changes |
| Constraints | `devsteps-aspect-constraints-subagent.agent.md` | Business & technical constraints |
| Quality | `devsteps-aspect-quality-subagent.agent.md` | Test coverage, code quality signals |
| Staleness | `devsteps-aspect-staleness-subagent.agent.md` | Obsolescence check, stale item detection |
| Integration | `devsteps-aspect-integration-subagent.agent.md` | Cross-package dependencies, API surface |

### Specialist Agents

| Agent | File | Role |
|---|---|---|
| Implementation | `devsteps-impl-subagent.agent.md` | Code writing, refactoring |
| Testing | `devsteps-test-subagent.agent.md` | Test generation, coverage analysis |
| Documentation | `devsteps-doc-subagent.agent.md` | Inline docs, architecture docs |
| Reviewer | `devsteps-reviewer.agent.md` | Quality gate, blocking review |

### Utility Agents

| Agent | File | Role |
|---|---|---|
| Documenter | `devsteps-documenter.agent.md` | User-facing documentation |
| Maintainer | `devsteps-maintainer.agent.md` | Housekeeping, backlog hygiene |
| Release & Impl | `devsteps.agent.md` | Release workflows, general implementation |
| Code Archaeology | `Detective-CodeArcheology.agent.md` | Deep legacy code investigation |

---

## Anti-Tunnel-Vision Protocol

All orchestrators apply the Anti-Tunnel-Vision Protocol before any analysis to prevent sequential analysis blind spots:

1. **Pre-declare all analysis dimensions** before starting
2. **Absence audit** — what should be here but isn't?
3. **Perspective independence** — complete each lens before folding findings
4. **Parallel dispatch** for items affecting >2 files
5. **Conflict harvesting** — list conflicts between perspectives before synthesis
6. **Adversarial gap challenge** — what did my analysis not cover?

---

## Session Classification

The Sprint Executor classifies each incoming request before acting:

| Signal | Classification | Action |
|---|---|---|
| Single item ID only | Single-item MPD | Coordinator protocol (not sprint pre-flight) |
| "sprint", "session", "backlog" | Multi-item sprint | Full sprint protocol |
| "continue sprint", "next items" | Resume sprint | Phase 1 from validated backlog |
| Item type = spike | Spike investigation | `analyst-context` + `planner` → no impl until direction set |
| "review", "validate" | Review request | `reviewer` only |
| No actionable items found | Empty sprint | Surface to user with blocked/draft list |

---

## Related Documents

- [Git Strategy](git-strategy.md)
- [Repository Strategy](repository-strategy.md)
- [Agent README](../../.github/agents/README.md)

## Related Work Items

- EPIC-025 — MPD Architecture Epic
- STORY-107 — CBP/JSON Envelope Implementation (done)
- SPIKE-012 — MPD Pattern Investigation

---

## Current Architecture: Spider Web (Spinnennetz) Dispatch Protocol

> Adopted March 2026. Supersedes Layer 1 & 2 MPD architecture above.

The Spider Web model replaces MPD's flat "aspects + impl/test/doc subagents" with a **concentric ring model**: `coord` sits at Ring 0 (centre), dispatching outward through analysis, cross-validation, planning, execution, and quality gate rings.

### Ring Structure

| Ring | Phase | Agents | Mode |
|------|-------|--------|------|
| 0 | Hub | `coord-*` | Dispatch + synthesis |
| 1 | Analysis | `analyst-archaeology`, `analyst-risk`, `analyst-quality`, `analyst-research` | Parallel fan-out |
| 2 | Cross-Validation | `aspect-impact`, `aspect-constraints`, `aspect-quality`, `aspect-staleness`, `aspect-integration` | Parallel fan-out (after Ring 1) |
| 3 | Planning | `exec-planner` | Sequential |
| 4 | Execution | `exec-impl` → `exec-test` ∧ `exec-doc` (conductors); `worker-*` (leaves) | Sequential/parallel |
| 5 | Quality Gate | `gate-reviewer` (blocking PASS/FAIL) | Sequential |

### Key Changes from MPD

| MPD (old) | Spider Web (current) |
|-----------|---------------------|
| `aspect-*` subagents | Ring 2 `aspect-*` agents (same names, different dispatch) |
| `impl-subagent` | Ring 4 `exec-impl` conductor → `worker-coder` |
| `test-subagent` | Ring 4 `exec-test` conductor → `worker-tester` |
| `doc-subagent` | Ring 4 `exec-doc` conductor → `worker-documenter` |
| `devsteps-reviewer` | Ring 5 `gate-reviewer` |
| `analyst-context-subagent` | Ring 1 `analyst-archaeology` |
| `analyst-web` + `analyst-internal` | Ring 1 `analyst-research` |
| Raw aspect envelopes read by coord | MandateResults read via `read_mandate_results` tool ONLY |

### Triage Tiers (unchanged)

The four-tier triage system (QUICK, STANDARD, FULL, COMPETITIVE) remains the same as documented in the MPD section above.

### Communication Protocol

All inter-agent communication uses structured MCP tools:
- `write_mandate_result` / `read_mandate_results` — analyst → coord
- `write_analysis_report` / `read_analysis_envelope` — detailed analysis storage
- `write_rejection_feedback` / `write_iteration_signal` — review-fix loop
- `write_escalation` — agent → coord escalation

For the authoritative protocol specification, see `.github/instructions/devsteps-agent-protocol.instructions.md`.
