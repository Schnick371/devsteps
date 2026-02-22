# Story: Tier-1 Reconstruction — Masteragent with Mandate Dispatch

## Problem

Today's `devsteps-coordinator.agent.md` and `devsteps-sprint-executor.agent.md` are **Tier-1 + Tier-2 fused**. They both route AND synthesize. This means:

1. Every aspect envelope arrives in the coordinator's context (context explosion for multi-item sprints)
2. The coordinator must understand analytics domain knowledge (impact graphs, constraint scoring, web research)
3. Sprint prompts contain execution logic that belongs in agents, not prompts
4. The boundary between "what the user triggered" and "what the agent decides" is blurry

## Target State

### `devsteps-40-sprint.prompt.md` → Pure User Trigger
**Today:** 150+ lines of execution logic  
**Target:** ~20 lines — describes WHAT the user wants, not HOW the agent executes  
```markdown
# Sprint Execution
Trigger the sprint-executor agent. Provide:
- Optional: item list to include (default: all Q1+Q2 planned items)
- Optional: focus areas or constraints
The agent handles all execution decisions autonomously.
```

### `devsteps-sprint-executor.agent.md` → Full Tier-1 Logic
**Today:** Has execution logic but still calls aspect agents directly  
**Target:** True Tier-1 routing only:

```
Phase 0: Dispatch Mandate "archaeology" → deep-analyst-archaeology
         Dispatch Mandate "risk-batch" → deep-analyst-risk (all items)
         Dispatch Mandate "planning" → deep-analyst-planner
         (all 3 parallel via runSubagent)

         Read MandateResults via read_mandate_results()
         Select execution order from planner's MandateResult
         
Phase 1 per item:
         Switch to feature branch
         If FULL/STANDARD: Dispatch Mandate "archaeology" + "risk" (parallel)
         Read MandateResults → synthesize into Task Brief (Tier 1 style)
         Dispatch Mandate "planning" → impl steps
         Dispatch impl-subagent with ONLY: item_id + mandate_results paths
         Dispatch Mandate "quality-review" → deep-analyst-quality
         Read ReviewVerdict → PASS: merge | FAIL: rejection-feedback loop

Phase 2 (every 5 items):
         Dispatch Mandate "archaeology-delta" + "planning-rerank" (parallel)
```

**Critical change:** Tier 1 NEVER reads raw aspect envelopes. Only `MandateResult` objects.

### `devsteps-20-start-work.prompt.md` → Single-Item Tier-1
**Today:** Mixes routing and synthesis  
**Target:** Route to the right Tier-2 analysts based on QUICK/STANDARD/FULL/COMPETITIVE triage, then collect MandateResults, then dispatch impl-subagent

### `devsteps-coordinator.agent.md` → Kept as Single-Item Tier-1 Reference
This is the "always right" reference implementation of Tier-1 behavior for one item.

## Triage Tier → Mandate Mapping

| Tier | Mandates dispatched | Tier-2 agents |
|---|---|---|
| QUICK | None (direct dispatch) | archaeology read from cache if available |
| STANDARD | archaeology + risk | deep-analyst-archaeology + deep-analyst-risk |
| FULL | archaeology + risk + planning | + deep-analyst-planner |
| COMPETITIVE | research | deep-analyst-research (replaces archaeology+risk) |

## Acceptance Criteria

- [ ] `devsteps-40-sprint.prompt.md` reduced to user-trigger (< 30 lines)
- [ ] `devsteps-sprint-executor.agent.md` dispatches Mandates, never aspect envelopes directly
- [ ] `devsteps-coordinator.agent.md` uses `read_mandate_results` instead of `read_analysis_envelope`
- [ ] Triage → Mandate mapping table in coordinator
- [ ] Coordinator context budget stays < 30K tokens for FULL-tier item
- [ ] `devsteps-20-start-work.prompt.md` updated with Mandate dispatch pattern
- [ ] All existing runSubagent calls for Tier-3 agents moved to Tier-2 agent files