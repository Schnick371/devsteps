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
| `devsteps-planner.agent.md` | Strategic sequencing, Enriched Sprint Brief, backlog reranking |

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

### Specialist Agents

| Agent File | Role | When Used |
|---|---|---|
| `devsteps-t3-impl.agent.md` | Code writing and refactoring | All tiers |
| `devsteps-t3-test.agent.md` | Test generation, coverage analysis | STANDARD / FULL |
| `devsteps-t3-doc.agent.md` | Inline docs, architecture documentation | FULL |
| `devsteps-reviewer.agent.md` | Blocking quality gate — PASS/FAIL review | After every item |

### Utility Agents

| Agent File | Role |
|---|---|
| `devsteps-documenter.agent.md` | User-facing documentation (README, guides) |
| `devsteps-maintainer.agent.md` | Backlog hygiene, stale item cleanup |
| `devsteps.agent.md` | Release workflows, general implementation |
| `Detective-CodeArcheology.agent.md` | Deep legacy code investigation |

---

## Risk Tier Dispatch

The coordinator determines a risk tier and dispatches agents accordingly:

```
QUICK      → impl-subagent only
STANDARD   → [impact + staleness] → [impl + test] (parallel pairs)
FULL       → [all 5 aspect agents] → synthesis → [impl + test + doc]
COMPETITIVE→ [analyst-internal + analyst-web] → judge → impl ± planner
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

All agent files use kebab-case with the following suffixes:

| Suffix | Meaning |
|---|---|
| `.agent.md` | Agent definition file |
| `-subagent.agent.md` | Spawned by coordinator, not invoked directly by user |
| `-coordinator.agent.md` | Orchestrator-level (manages other agents) |
| `-executor.agent.md` | Session-level execution controller |

> **Note:** Old agent names (`devsteps-analyzer`, `devsteps-implementer`, `devsteps-tester`) were deprecated in Feb 2026. Current names use the `-subagent` suffix pattern.

---

## Session Classification

The Sprint Executor self-classifies incoming requests:

| Input Signal | Classification | Action |
|---|---|---|
| Single item ID only | Single-item MPD | Coordinator flow (no sprint pre-flight) |
| "sprint", "session", "backlog" | Multi-item sprint | Full sprint protocol |
| "continue sprint", "next items" | Resume sprint | Phase 1 from saved backlog |
| `type=spike` or "investigate" | Spike | `analyst-context` + `planner`, no impl until direction set |
| "review", "validate", "check" | Review | `reviewer` only |
| No actionable items found | Empty sprint | Present blocked/draft list to user |

---

## Compressed Briefing Protocol (CBP)

Agents communicate via structured JSON envelopes, not free-form text:

```
Aspect Agents → write_analysis_report(AnalysisBriefing)
                                    ↓
Coordinator ← read_analysis_envelope → synthesize → write_verdict(CompressedVerdict)
                                                              ↓
                              impl/test/doc-subagents ← read_analysis_envelope
```

See [docs/architecture/mpd-architecture.md](../../docs/architecture/mpd-architecture.md) for full CBP field specifications.

---

## References

- [MPD Architecture](../../docs/architecture/mpd-architecture.md) — full architecture documentation
- [Git Strategy](../../docs/architecture/git-strategy.md) — branching and commit conventions
- [Repository Strategy](../../docs/architecture/repository-strategy.md) — dual-repo setup

---


**Last updated:** 2026-02-21 — Rewrote from old "Coordinator + 4 workers" model to current MPD architecture  
**Related items:** STORY-098, EPIC-025, STORY-107