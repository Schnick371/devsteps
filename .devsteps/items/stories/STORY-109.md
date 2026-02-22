# Story: Tier-2 Deep Analyst Agents — Six Domain-Synthesis Specialists

## Problem

Today the Coordinator (Tier 1) synthesizes all aspect-subagent envelopes directly — in the same context window where it also routes, orchestrates, and makes decisions. For a sprint with 10 items × 5 aspects = 50 envelopes flooding one context. This is the primary cause of coordinator context explosion.

**Solution:** Introduce dedicated Tier-2 Deep Analysts that each handle ONE mandate domain, synthesize their own Tier-3 envelopes, and report only a `MandateResult` (~800 tokens) back to Tier 1 — never the raw envelopes.

## Agent Specifications

### 1. `devsteps-deep-analyst-archaeology.agent.md`
**Mandate received:** "Build a complete picture of how [area] works today"  
**Dispatches (parallel):** `context-subagent` (global map) + `internal-subagent` (specific files)  
**Clarification loop:** If context findings reveal unexpected dependencies → targeted internal re-dispatch  
**Writes:** `write_mandate_result` with type=`archaeology`  
**MandateResult contains:**
- Entry points into the affected area
- Undocumented dependencies (the things code search misses)
- Architectural risk hotspots (patterns that make changes dangerous)
- Exact file paths + line ranges for impl-subagent  

### 2. `devsteps-deep-analyst-risk.agent.md`
**Mandate received:** "What could this change break, at what probability?"  
**Dispatches (parallel):** `impact-subagent` + `integration-subagent` + `constraints-subagent`  
**Writes:** `write_mandate_result` with type=`risk`  
**MandateResult contains:**
- Risk matrix: component × probability × severity
- Cross-package blast radius
- Test coverage gaps that increase risk
- Hard constraints that must not be violated  

### 3. `devsteps-deep-analyst-research.agent.md`
**Mandate received:** "What is the best technical approach for X?"  
**Dispatches (parallel):** `web-subagent` + `internal-subagent`  
**Clarification loop:** Web findings trigger targeted internal-subagent to verify if pattern fits our codebase  
**Writes:** `write_mandate_result` with type=`research`  
**MandateResult contains:**
- Recommended approach with explicit rationale
- 2 alternatives with trade-off table
- Deprecation risk (from web-subagent)
- Codebase fit assessment (from internal-subagent)

### 4. `devsteps-deep-analyst-quality.agent.md`
**Mandate received:** "Is the implementation correct, complete, and consistent?"  
**Dispatches (parallel):** `quality-subagent` + `staleness-subagent`  
**Review-Fix loop:** If quality-subagent finds gaps → `write_rejection_feedback` → triggers impl re-run  
**Writes:** `write_mandate_result` with type=`quality`  
**MandateResult contains:**
- Quality verdict: GO | CONDITIONAL | FAIL
- Specific gaps with file:line references
- Missing test cases
- Pattern inconsistencies vs. codebase conventions

### 5. `devsteps-deep-analyst-planner.agent.md`
**Mandate received:** "Decompose this story/task into concrete, ordered implementation steps"  
**Reads (not dispatches):** Archaeology + Risk MandateResults from `.devsteps/analysis/[itemId]/`  
**Then dispatches:** `staleness-subagent` (verify no conflicting active work)  
**Writes:** `write_mandate_result` with type=`planning`  
**MandateResult contains:**
- Ordered impl steps (atomic: one file per step)
- Dependency order between steps
- Test requirements per step
- File paths pre-identified (impl-subagent opens them, doesn't search)
- Estimated risk tier per step (QUICK/STANDARD/FULL)

### 6. Upgrade: `devsteps-reviewer.agent.md` → Tier-2 behavior
**Today:** Binary PASS/FAIL  
**New:** Full Tier-2 Deep Analyst reviewer with:
- Dispatches `quality-subagent` for automated checks
- If FAIL: `write_rejection_feedback` (structured, not prose)
- Tracks iteration count via `write_iteration_signal`
- After 2 FAILs: `write_escalation` → Tier 1 must decide (not retry again)

## Shared Behavioral Contract for ALL Tier-2 Agents

1. **Receive mandate via prompt** (Tier 1 provides item_id + mandate_type + scope)
2. **Read existing MandateResults** via `read_mandate_results(item_id)` before dispatching (avoid redundant work)
3. **Dispatch Tier-3 agents** — maximum 5 per turn, all parallel
4. **Read envelopes** via `read_analysis_envelope` — NEVER paste raw content in chat
5. **Synthesize** in own context — apply contradiction detection, confidence weighting
6. **Write** via `write_mandate_result` — synthesis max 500 chars
7. **Return ONLY** the `report_path` and `verdict` to Tier 1 in chat (never the content)

## Acceptance Criteria

- [ ] All 6 agent files created/updated in `.github/agents/`
- [ ] Each agent has clear: mandate input format, dispatch list, loop rules, output format
- [ ] All agents use `write_mandate_result` not free-text synthesis
- [ ] YAML frontmatter valid (agent, model, description, tools)
- [ ] README.md updated with Tier-2 section