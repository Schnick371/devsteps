# DevSteps Multi-Agent System

## Overview

The DevSteps agent system uses **Multi-Perspective Dispatch (MPD)** as its core orchestration pattern. Instead of a single sequential analysis pass, MPD dispatches specialized agents in parallel to eliminate blind spots before synthesis and implementation.

The system uses a **Spinnennetz (Spider Web)** topology — structurally identical to a radar/spider chart (Netzdiagramm):

- **Concentric rings** = execution phases: Analysis → Cross-Validation → Planning → Execution → Gate
- **Radial spokes** = domains: Code · Tests · Docs · Risk · Research · Work Items · Errors
- **coord at the centre** — dispatches all agents in one level, synthesizes all returning signals. No nested dispatch (VS Code constraint).

Like a radar chart, the spoke weights shift per task: a bug fix emphasizes Errors + Code, a feature emphasizes Research + Tests + Docs.

- **Coordinator MPD** — single work item orchestration with risk-based parallel fan-out
- **Sprint Executor MPD** — full sprint / session orchestration with pre-flight analysis

**Architecture details:** [AGENT-DISPATCH-PROTOCOL.md](./AGENT-DISPATCH-PROTOCOL.md) · [REGISTRY.md](./REGISTRY.md)

---

## Agent Roster

### Orchestrators

| Agent File                       | Role                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `devsteps-R0-coord.agent.md`        | Single-item MPD orchestration — triage, parallel dispatch, synthesis             |
| `devsteps-R0-coord-sprint.agent.md` | Multi-item sprint orchestration — pre-flight, per-item loop, adaptive replanning |

### Analyst Agents

| Agent File                           | Role                                                  | Trigger                    |
| ------------------------------------ | ----------------------------------------------------- | -------------------------- |
| `devsteps-R1-analyst-context.agent.md`  | Global codebase archaeology, dependency mapping       | Sprint Phase 0 / FULL tier |
| `devsteps-R1-analyst-internal.agent.md` | Deep code analysis, API contract inspection           | COMPETITIVE tier           |
| `devsteps-R1-analyst-web.agent.md`      | External research, library comparison, best practices | COMPETITIVE tier           |

### Aspect Agents (parallel, STANDARD / FULL tiers)

| Agent File                             | Analysis Dimension                                |
| -------------------------------------- | ------------------------------------------------- |
| `devsteps-R2-aspect-impact.agent.md`      | Structural impact — what files and APIs change    |
| `devsteps-R2-aspect-constraints.agent.md` | Business & technical constraints                  |
| `devsteps-R2-aspect-quality.agent.md`     | Test coverage, code quality signals               |
| `devsteps-R2-aspect-staleness.agent.md`   | Obsolescence detection, stale item identification |
| `devsteps-R2-aspect-integration.agent.md` | Cross-package dependencies, API surface effects   |

### Synthesis & Quality Gate (T2)

| Agent File                              | Role                                                      | When Used        |
| --------------------------------------- | --------------------------------------------------------- | ---------------- |
| `devsteps-R1-analyst-archaeology.agent.md` | Codebase archaeology, structural map                      | STANDARD / FULL  |
| `devsteps-R1-analyst-risk.agent.md`        | Risk matrix, blast radius, constraint analysis            | STANDARD / FULL  |
| `devsteps-R1-analyst-research.agent.md`    | External research, library comparison                     | COMPETITIVE      |
| `devsteps-R1-analyst-quality.agent.md`     | Automated gates, test coverage assessment                 | FULL             |
| `devsteps-R3-exec-planner.agent.md`        | Synthesis of MandateResults → ordered implementation plan | All tiers        |
| `devsteps-R5-gate-reviewer.agent.md`       | Blocking quality gate — PASS/FAIL review                  | After every item |

### Exec Conductors (dispatched by coord after exec-planner MandateResult available)

| Agent File                    | Role                     | When Used       |
| ----------------------------- | ------------------------ | --------------- |
| `devsteps-R4-exec-impl.agent.md` | Implementation Conductor | All tiers       |
| `devsteps-R4-exec-test.agent.md` | Test Conductor           | STANDARD / FULL |
| `devsteps-R4-exec-doc.agent.md`  | Documentation Conductor  | FULL            |

### Exec Workers (all dispatched directly by coord — leaf nodes)

| Agent File                              | Role                     |
| --------------------------------------- | ------------------------ |
| `devsteps-R4-worker-impl.agent.md`         | Code writing             |
| `devsteps-R4-worker-test.agent.md`         | Test generation          |
| `devsteps-R4-worker-doc.agent.md`          | Documentation writing    |
| `devsteps-R4-worker-coder.agent.md`        | Targeted code edits      |
| `devsteps-R4-worker-tester.agent.md`       | Test execution           |
| `devsteps-R4-worker-documenter.agent.md`   | Documentation updates    |
| `devsteps-R4-worker-devsteps.agent.md`     | DevSteps item operations |
| `devsteps-R4-worker-guide-writer.agent.md` | Guide file updates       |

---

## Risk Tier Dispatch

The coordinator determines a risk tier and dispatches agents accordingly:

```
QUICK      → exec-planner → exec-impl → gate-reviewer
STANDARD   → [analyst-archaeology ∥ analyst-risk] → exec-planner → exec-impl → exec-test → gate-reviewer
FULL       → [analyst-archaeology ∥ analyst-risk ∥ analyst-quality] → exec-planner → exec-impl → [exec-test ∥ exec-doc] → gate-reviewer
COMPETITIVE→ [analyst-research ∥ analyst-archaeology] → exec-planner → exec-impl → gate-reviewer

Note: coord dispatches ALL agents directly — no nested dispatch (VS Code constraint).
```

### Tier Selection Signals

| Signal                                       | Tier        |
| -------------------------------------------- | ----------- |
| Isolated, single-file, full coverage         | QUICK       |
| Cross-file, shared modules, partial coverage | STANDARD    |
| Schema change, cross-package, CRITICAL label | FULL        |
| Investigation, "which approach/library?"     | COMPETITIVE |

---

## Naming Convention

All agent files use `devsteps-{role}-{name}.agent.md`:

| Role prefix         | Function                                  | Dispatch                   |
| ------------------- | ----------------------------------------- | -------------------------- |
| `devsteps-R0-coord-`   | Coordinator — dispatches all other agents | User-invokable via prompts |
| `devsteps-analyst-` | Deep analysis, mandate production         | Dispatched by coord coord  |
| `devsteps-aspect-`  | Single-aspect scanner                     | Dispatched by coord coord  |
| `devsteps-exec-`    | Execution orchestration (impl/test/doc)   | Dispatched by coord coord  |
| `devsteps-gate-`    | Blocking QA gate                          | Dispatched by coord coord  |
| `devsteps-worker-`  | Leaf executor                             | Dispatched by coord coord  |

> **Key constraint**: VS Code does not support nested `runSubagent` calls. coord agents dispatch all agents directly. Every non-coordinator agent is a leaf node.
> Every agent file contains a `## Contract` section marking its role, dispatcher, and return format.

---

## Session Classification

The Sprint Executor self-classifies incoming requests:

| Input Signal                    | Classification    | Action                                                              |
| ------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Single item ID only             | Single-item MPD   | Coordinator flow (no sprint pre-flight)                             |
| "sprint", "session", "backlog"  | Multi-item sprint | Full sprint protocol                                                |
| "continue sprint", "next items" | Resume sprint     | Phase 1 from saved backlog                                          |
| `type=spike` or "investigate"   | Spike             | `analyst-archaeology` + `exec-planner`, no impl until direction set |
| "review", "validate", "check"   | Review            | `devsteps-R5-gate-reviewer` only                                       |
| No actionable items found       | Empty sprint      | Present blocked/draft list to user                                  |

---

## Compressed Briefing Protocol (CBP)

Agents communicate via structured JSON envelopes, not free-form text:

```
Aspect/Analyst Agents → write_analysis_report(AnalysisBriefing)
                                    ↓
              coord ← read_mandate_results(item_ids) ← write_mandate_result(MandateResult)
                                    ↓
              Exec Agents (impl/test/doc) ← report_path + item_id  [dispatched by coord]
                                    ↓
              Worker Agents ← report_path + item_id  [also dispatched by coord]
```

---

## References

- [AGENT-DISPATCH-PROTOCOL.md](./AGENT-DISPATCH-PROTOCOL.md) — Spider Web model, rings, spokes, dispatch invariants
- [REGISTRY.md](./REGISTRY.md) — full agent roster and routing table

---

**Last updated:** 2026-02-23 — Renamed all agents to Spider Web role-based convention, removed tier labels, added bright-data/\* to web research agents, added vscode/askQuestions to coord agents  
**Related items:** STORY-098, EPIC-025, STORY-107, SPIKE-014
