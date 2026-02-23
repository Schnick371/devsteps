# DevSteps Multi-Agent System

## Overview

The DevSteps agent system uses **Multi-Perspective Dispatch (MPD)** as its core orchestration pattern. Instead of a single sequential analysis pass, MPD dispatches specialized agents in parallel to eliminate blind spots before synthesis and implementation.

The system operates at two layers:
- **Coordinator MPD** — single work item orchestration with risk-based dispatch
- **Sprint Executor MPD** — full sprint / session orchestration with pre-flight analysis

**For the full architecture documentation see:** [docs/architecture/mpd-architecture.md](../../docs/architecture/mpd-architecture.md)

---

## Agent Roster

### Orchestrators

| Agent File | Role |
|---|---|
| `devsteps-t1-coordinator.agent.md` | Single-item MPD orchestration — triage, parallel dispatch, synthesis |
| `devsteps-t1-sprint-executor.agent.md` | Multi-item sprint orchestration — pre-flight, per-item loop, adaptive replanning |

### Analyst Agents

| Agent File | Role | Trigger |
|---|---|---|
| `devsteps-t3-analyst-context.agent.md` | Global codebase archaeology, dependency mapping | Sprint Phase 0 / FULL tier |
| `devsteps-t3-analyst-internal.agent.md` | Deep code analysis, API contract inspection | COMPETITIVE tier |
| `devsteps-t3-analyst-web.agent.md` | External research, library comparison, best practices | COMPETITIVE tier |

### Aspect Agents (parallel, STANDARD / FULL tiers)

| Agent File | Analysis Dimension |
|---|---|
| `devsteps-t3-aspect-impact.agent.md` | Structural impact — what files and APIs change |
| `devsteps-t3-aspect-constraints.agent.md` | Business & technical constraints |
| `devsteps-t3-aspect-quality.agent.md` | Test coverage, code quality signals |
| `devsteps-t3-aspect-staleness.agent.md` | Obsolescence detection, stale item identification |
| `devsteps-t3-aspect-integration.agent.md` | Cross-package dependencies, API surface effects |

### Synthesis & Quality Gate (T2)

| Agent File | Role | When Used |
|---|---|---|
| `devsteps-t2-archaeology.agent.md` | Codebase archaeology, structural map | STANDARD / FULL |
| `devsteps-t2-risk.agent.md` | Risk matrix, blast radius, constraint analysis | STANDARD / FULL |
| `devsteps-t2-research.agent.md` | External research, library comparison | COMPETITIVE |
| `devsteps-t2-quality.agent.md` | Automated gates, test coverage assessment | FULL |
| `devsteps-t2-planner.agent.md` | Synthesis of MandateResults → ordered implementation plan | All tiers |
| `devsteps-t2-reviewer.agent.md` | Blocking quality gate — PASS/FAIL review | After every item |

### T3 Exec Workers (dispatched by T1 after planning MandateResult available)

| Agent File | Role | When Used |
|---|---|---|
| `devsteps-t3-impl.agent.md` | Code writing and refactoring | All tiers |
| `devsteps-t3-test.agent.md` | Test generation, coverage analysis | STANDARD / FULL |
| `devsteps-t3-doc.agent.md` | Inline docs, architecture documentation | FULL |

---

## Risk Tier Dispatch

The coordinator determines a risk tier and dispatches agents accordingly:

```
QUICK      → t3-impl → t2-reviewer
STANDARD   → [t2-archaeology + t2-risk] → t2-planner → [t3-impl + t3-test] → t2-reviewer
FULL       → [t2-archaeology + t2-risk + t2-quality] → t2-planner → [t3-impl + t3-test + t3-doc] → t2-reviewer
COMPETITIVE→ [t2-research + t2-archaeology] → t2-planner → t3-impl → t2-reviewer
```

### Tier Selection Signals

| Signal | Tier |
|---|---|
| Isolated, single-file, full coverage | QUICK |
| Cross-file, shared modules, partial coverage | STANDARD |
| Schema change, cross-package, CRITICAL label | FULL |
| Investigation, "which approach/library?" | COMPETITIVE |

---

## Naming Convention

All agent files use kebab-case with tier-prefix naming:

| Prefix | Tier | Role |
|---|---|---|
| `devsteps-t1-` | Tier 1 | Orchestrators (user-invokable via prompts) |
| `devsteps-t2-` | Tier 2 | Analysts + Quality Gate (dispatched by T1) |
| `devsteps-t3-` | Tier 3 | Leaf agents (dispatched by T2, or T3-Exec by T1) |

> **Tier identification**: Every agent file contains a `## Contract` section marking its tier, dispatcher, and return format.

---

## Session Classification

The Sprint Executor self-classifies incoming requests:

| Input Signal | Classification | Action |
|---|---|---|
| Single item ID only | Single-item MPD | Coordinator flow (no sprint pre-flight) |
| "sprint", "session", "backlog" | Multi-item sprint | Full sprint protocol |
| "continue sprint", "next items" | Resume sprint | Phase 1 from saved backlog |
| `type=spike` or "investigate" | Spike | `t2-archaeology` + `t2-planner`, no impl until direction set |
| "review", "validate", "check" | Review | `devsteps-t2-reviewer` only |
| No actionable items found | Empty sprint | Present blocked/draft list to user |

---

## Compressed Briefing Protocol (CBP)

Agents communicate via structured JSON envelopes, not free-form text:

```
T3 Aspect/Analyst Agents → write_analysis_report(AnalysisBriefing)
                                    ↓
T2 Agent ← read_analysis_envelope → synthesize → write_mandate_result(MandateResult)
                                                              ↓
                              T1 ← read_mandate_results(item_ids)
                                                              ↓
                              T3 Exec (impl/test/doc) ← report_path + item_id
```

See [docs/architecture/mpd-architecture.md](../../docs/architecture/mpd-architecture.md) for full CBP field specifications.

---

## References

- [MPD Architecture](../../docs/architecture/mpd-architecture.md) — full architecture documentation
- [Git Strategy](../../docs/architecture/git-strategy.md) — branching and commit conventions
- [Repository Strategy](../../docs/architecture/repository-strategy.md) — dual-repo setup

---


**Last updated:** 2026-02-23 — Renamed all T1+T3 agents to tier-prefix convention, removed non-Tx standalone agents, added bright-data/* to web research agents, added vscode/askQuestions to T1 agents  
**Related items:** STORY-098, EPIC-025, STORY-107, SPIKE-014