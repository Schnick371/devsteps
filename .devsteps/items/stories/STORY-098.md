# Story: Coordinator MPD Architecture — Multi-Perspective Dispatch Pattern Documentation

## User Value

**As a** developer working with DevSteps agents,
**I want** clear documentation of the Multi-Perspective Dispatch (MPD) architecture,
**so that** I understand how the coordinator, analysts, aspect agents, and specialist subagents interact and can extend or debug the system confidently.

## Context — What Actually Exists (2026)

> ⚠️ **This story was rewritten 2026-02-21.** The original description referenced a simple "Executor Mode" (coordinator delegates planning → executes plan) and non-existent agents (`devsteps-analyzer`, `devsteps-implementer`, `devsteps-tester`). The actual implemented architecture is significantly more sophisticated.

The DevSteps agent system uses **Multi-Perspective Dispatch (MPD)** as its core orchestration pattern, implemented across two layers:

### Layer 1 — Coordinator (single-item MPD)

`devsteps-coordinator.agent.md` orchestrates one work item at a time through a risk-tiered dispatch loop:

**QUICK tier** — isolated, single-file, full coverage:
- `devsteps-impl-subagent` only

**STANDARD tier** — cross-file, shared modules, partial coverage:
- Parallel: `devsteps-aspect-impact-subagent` + `devsteps-aspect-staleness-subagent`
- Then parallel: `devsteps-impl-subagent` + `devsteps-test-subagent`

**FULL tier** — schema changes, cross-package, CRITICAL risk:
- Parallel (all 5): `devsteps-aspect-impact-subagent`, `devsteps-aspect-constraints-subagent`, `devsteps-aspect-quality-subagent`, `devsteps-aspect-staleness-subagent`, `devsteps-aspect-integration-subagent`
- Synthesis → Enriched Task Brief
- Parallel: `devsteps-impl-subagent` + `devsteps-test-subagent` + `devsteps-doc-subagent`

**COMPETITIVE tier** — "which pattern/library/approach?" items:
- Parallel: `devsteps-analyst-internal-subagent` + `devsteps-analyst-web-subagent`
- Judge → `devsteps-impl-subagent` ± `devsteps-planner`

### Layer 2 — Sprint Executor (multi-item MPD)

`devsteps-sprint-executor.agent.md` orchestrates entire sprints:

**Phase 0 — Pre-flight (once):**
- `devsteps-analyst-context-subagent` → global archaeology
- `devsteps-aspect-staleness-subagent` (batch) → obsolescence check
- `devsteps-planner` → Enriched Sprint Brief (ordering + risk scores + conflict map)

**Phase 1 — Per-item loop:**
- Triage → coordinator MPD dispatch → `devsteps-reviewer` (BLOCKING)
- Merge to main on PASS, surface to user on FAIL

**Phase 2 — Adaptive replanning (every 5 items or 2 h):**
- `devsteps-analyst-context-subagent` (delta) + `devsteps-planner` (rerank)

### Signal Protocol — Compressed Briefing Protocol (CBP)

Implemented in STORY-107. Analysts and aspect agents write structured JSON via `write_analysis_report` MCP tool; coordinator reads via `read_analysis_envelope`; coordinator writes `CompressedVerdict` via `write_verdict`; impl/test/doc subagents read verdict at session start via `read_analysis_envelope`.

**Signal flow:**
```
Aspect Subagent → write_analysis_report (AnalysisBriefing JSON)
                ↓
Coordinator ← read_analysis_envelope → synthesize → write_verdict (CompressedVerdict JSON)
                ↓
impl/test/doc-subagent ← read_analysis_envelope (CompressedVerdict)
```

### Full Agent Roster (current naming, Feb 2026)

| Role | Agent file |
|---|---|
| Coordinator (MPD orchestrator) | `devsteps-coordinator.agent.md` |
| Sprint orchestrator | `devsteps-sprint-executor.agent.md` |
| Strategic planner | `devsteps-planner.agent.md` |
| Codebase archaeology | `devsteps-analyst-context-subagent.agent.md` |
| Internal code analysis | `devsteps-analyst-internal-subagent.agent.md` |
| External research | `devsteps-analyst-web-subagent.agent.md` |
| Aspect: impact | `devsteps-aspect-impact-subagent.agent.md` |
| Aspect: constraints | `devsteps-aspect-constraints-subagent.agent.md` |
| Aspect: quality | `devsteps-aspect-quality-subagent.agent.md` |
| Aspect: staleness | `devsteps-aspect-staleness-subagent.agent.md` |
| Aspect: integration | `devsteps-aspect-integration-subagent.agent.md` |
| Implementation specialist | `devsteps-impl-subagent.agent.md` |
| Testing specialist | `devsteps-test-subagent.agent.md` |
| Documentation specialist | `devsteps-doc-subagent.agent.md` |
| Reviewer (quality gate) | `devsteps-reviewer.agent.md` |
| Documenter (user-facing) | `devsteps-documenter.agent.md` |
| Maintainer | `devsteps-maintainer.agent.md` |
| Release & implementation | `devsteps.agent.md` |
| Code archaeology | `Detective-CodeArcheology.agent.md` |

## Acceptance Criteria

### 1. Architecture document created
- [ ] Create `docs/architecture/mpd-architecture.md`
- [ ] Document MPD coordinator pattern (triage tiers, agent roles, dispatch rules)
- [ ] Document sprint-executor two-layer orchestration (Phase 0 / 1 / 2)
- [ ] Include CBP signal flow diagram (AnalysisBriefing → CompressedVerdict)
- [ ] Document all 19 current agents with role, trigger condition, and output format

### 2. Agent README updated
- [ ] Update `.github/agents/README.md` with current agent roster and naming convention
- [ ] Correct any references to old names (devsteps-analyzer, devsteps-implementer, devsteps-tester)
- [ ] Add MPD triage table showing which agents fire per tier

### 3. Cross-references verified
- [ ] EPIC-025 `affected_paths` updated to reflect current agent filenames
- [ ] STORY-086 flagged for staleness — references to `devsteps-analyzer.agent.md` etc. must be corrected before execution
- [ ] TASK-230 description updated — agent names now use `-subagent` suffix

### 4. Definition of Done
- `docs/architecture/mpd-architecture.md` committed
- `.github/agents/README.md` accurate
- No stale agent name references in description of any `draft`/`planned` item
- Committed with conventional format: `docs(architecture): add MPD architecture documentation`

## Dependencies

- Depends on: STORY-107 (done — CBP/JSON envelope implementation)
- Relates to: EPIC-025, EPIC-022, SPIKE-012

## Notes on Related Stale Items

| Item | Issue | Recommendation |
|---|---|---|
| STORY-086 | `affected_paths` list references `devsteps-analyzer.agent.md`, `devsteps-implementer.agent.md`, `devsteps-tester.agent.md` (don't exist) | Update paths before executing |
| TASK-230 | Description calls agents "web-analyst, internal-analyst" (wrong names) | Update description to use current `-subagent` suffix names |
| EPIC-025 | `affected_paths` may include stale names | Review before closing |

## Estimated Effort

**Complexity:** Medium (documentation + cross-reference audit)
**Timeline:** 2–4 hours
**Risk:** Low — no code changes required