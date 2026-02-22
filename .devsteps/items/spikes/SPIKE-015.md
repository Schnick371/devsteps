# Spike: Tier-4 Atomic Executor Design + Loop Formalization

## Goal

Research and design the **Tier-4 layer** and formalize all **loop patterns** before implementing them. This spike prevents premature implementation of patterns that may need rethinking.

## Research Questions

### Q1: Can GitHub Copilot subagents spawn sub-subagents?
- Test: Can `impl-subagent` call `#runSubagent` targeting another agent?
- If YES → Tier-4 is just another `#runSubagent` call from Tier-3 level
- If NO → Tier-4 must be simulated via tool calls within the same subagent context
- **Hypothesis:** No — subagents are leaf nodes in today's Copilot architecture

### Q2: What is the practical atomic unit within Tier 3?
- Today: `impl-subagent` handles entire stories (too large)
- Options:
  - A) impl-subagent per FILE (one subagent per affected file)
  - B) impl-subagent per FUNCTION (very fine-grained, high orchestration overhead)
  - C) impl-subagent per STEP from deep-analyst-planner's Implementation Plan
  - **Hypothesis:** C is optimal — step = one coherent change, pre-analyzed by planner

### Q3: How do loop bounds work in practice?
- TDD loop: what triggers "test passed" as a CBP signal? (can subagent read test output?)
- Review-Fix loop: does `write_rejection_feedback` need to be structured enough for CI validation?
- **Hypothesis:** Loops need a `write_iteration_signal(status: "continuing" | "exhausted")` marker that Tier 1 reads to detect stuck loops

### Q4: Does a 5th tier make sense?
- Tier 5 = atomic validator (one lint rule, one type check, one test)
- Would allow parallel validation of EACH acceptance criterion
- Cost: high orchestration overhead for potentially minor gain
- **Hypothesis:** Not needed yet — Tier-4 with atomic steps PLUS IterationSignal tracking is sufficient for 2026

### Q5: Where do lateral loops fit? (growing in breadth)
- Example: `deep-analyst-research` → web-subagent → internal-subagent → BACK to web-subagent
- Is this a loop or just sequential dispatch with caching?
- **Hypothesis:** This is a clarification loop, bounded by `ClarificationCountSchema` embedded in MandateResult

## Deliverables

1. **Architecture Decision Record:** `docs/architecture/tier4-decision.md`
   - Answer to Q1-Q5 with evidence
   - Decision: implement Tier-4 now | defer | or simulate within Tier-3

2. **Loop Pattern Specification:** `docs/architecture/loop-patterns.md`
   - Formal spec of all 5 loop types
   - Termination conditions (hard)
   - CBP signals per loop type
   - Token budget per loop iteration

3. **Updated EPIC-028 scope** (if Q1-Q4 change assumptions)
   - Which Tier-4 elements belong in EPIC-028 scope?
   - Which are deferred to EPIC-029?

## Acceptance Criteria

- [ ] Q1-Q5 answered with evidence (not just hypothesis)
- [ ] Loop termination conditions are ALWAYS bounded (no infinite loops possible)
- [ ] ADR + Loop Pattern Spec committed to `docs/architecture/`
- [ ] Findings feed back into STORY-108 (schema adjustments) and STORY-109 (agent adjustments)
- [ ] EPIC-028 scope re-validated or scope change items created