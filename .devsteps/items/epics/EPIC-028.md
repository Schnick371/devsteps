# N-Tier Agent Hierarchy: Tier-2 Deep Analysts + Loop Support

## Vision

Extend the current 2-tier (Coordinator ↔ Aspect Subagents) into a true **N-tier architecture** where each tier performs exactly ONE atomic cognitive operation. The key insight: today's Coordinator conflates routing, synthesis, and decision-making into one context — causing context explosion in multi-item sprints and preventing true parallelism.

## The Atomic Cognitive Principle

Each agent may perform exactly ONE cognitive primitive:

| Primitive | Tier | Today's Problem |
|---|---|---|
| **Route** | Tier 1: Masteragent | ✅ done, but overloaded |
| **Synthesize** | Tier 2: Deep Analysts | ❌ MISSING — coordinator does this inline |
| **Analyze** | Tier 3: Aspect/Analyst subagents | ✅ done |
| **Execute** | Tier 3: impl-subagent | impl-subagent also verifies and synthesizes |
| **Verify** | Tier 3→4: future | merged into quality-subagent |
| **Atomic Edit** | Tier 4 (future) | not yet designed |

## Tier 2 — What Deep Analysts Are Needed

### Analysis Side (understanding what IS)
- `deep-analyst-archaeology` — "How does [area] work today?" → dispatches context + internal
- `deep-analyst-risk` — "What could this change break?" → dispatches impact + integration + constraints
- `deep-analyst-research` — "What is the best approach?" → dispatches web + internal (competitive mode)
- `deep-analyst-quality` — "Is the implementation correct?" → dispatches quality + staleness

### Execution Side (planning what to DO)
- `deep-analyst-planner` — "Decompose into ordered atomic steps" → synthesizes Archaeology + Risk results into Implementation Plan
- `deep-analyst-reviewer` — Upgrade: structured RejectionFeedback instead of binary PASS/FAIL

## Loop Patterns

```
LOOP 1: TDD Inner Loop (Tier 3, impl-subagent coordinates)
  impl → tests → FAIL → write_iteration_signal(N) → impl(correction) → ...
  Max 3 iterations → escalate to Tier 2

LOOP 2: Review-Fix Loop (Tier 2, deep-analyst-reviewer orchestrates)
  quality-subagent → FAIL → write_rejection_feedback → impl-subagent(re-run)
  Max 2 iterations → escalate to Tier 1 (sprint pause)

LOOP 3: Clarification Loop (within Tier 2)
  Tier-2 reads envelopes → gap → targeted Tier-3 re-dispatch (no new tool needed)

LOOP 4: Escalation (upward through all tiers)
  Tier 3 discovers architectural red flag → write_escalation
  → included in MandateResult.blockers → Tier 1 pauses sprint

LOOP 5: Adaptive Replanning (Tier 1 → Tier 2 → Tier 1)
  Every 5 items: archaeology-analyst(delta) + planner-analyst(rerank) → updated sprint brief
```

## CBP Extension (what's missing)

Builds on **EPIC-027** (done: Tier 3 ↔ Tier 1 CBP tools).

New layer: **Tier 2 ↔ Tier 1 communication**:
- `MandateSchema` + `MandateResultSchema` (Zod)
- `write_mandate_result` + `read_mandate_results` MCP tools

Loop support:
- `RejectionFeedbackSchema` + `write_rejection_feedback`
- `IterationSignalSchema` + `write_iteration_signal`
- `EscalationSignalSchema` + `write_escalation`

## Scope: Stories

1. **STORY: MandateResult CBP Extension** — schemas + MCP tools for Tier 2 ↔ Tier 1
2. **STORY: Tier-2 Deep Analyst Agents** — 6 new agent files
3. **STORY: Tier-1 Reconstruction** — sprint-executor + coordinator rewritten to dispatch Mandates
4. **SPIKE: Tier-4 Atomic Executor Design** — research: can subagents spawn sub-subagents?

## Depends On
- EPIC-027 (done — CBP Tier-3 foundation)
- STORY-107 (done — CBP MCP tools v1)

## Success Criteria
- Sprint of 10 items runs without coordinator context explosion
- Each Tier-2 agent's context window stays under 30K tokens
- Loop count is always bounded (never infinite)
- All inter-tier communication goes via CBP tools (never chat text)