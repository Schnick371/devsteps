# Task: Rewrite coordinator Agent as Single-Item Tier-1 Reference

## Purpose
The coordinator handles SINGLE items (from `devsteps-20-start-work.prompt.md`).  
It is the "single-item reference implementation" of Tier-1 behavior.  
The sprint-executor extends this pattern to N items.

## Transformation

### Current State
Coordinator reads aspect envelopes directly (context grows with every analyst)

### New Pattern: Mandate → MandateResult → Decision
```
Triage Decision (local, no subagent needed):
  Evaluate: item size (S/M/L/XL), complexity tags, isDependencyBlocking
  → Select: QUICK | STANDARD | FULL | COMPETITIVE

QUICK path (direct dispatch):
  dispatch: impl-subagent with item briefing
  dispatch: deep-analyst-quality (quality gate)

STANDARD path:
  dispatch: deep-analyst-archaeology + deep-analyst-risk (parallel mandates)
  read: 2 MandateResults → synthesize briefing (Tier-1, ~50 lines of synthesis)
  dispatch: impl-subagent with briefing
  dispatch: deep-analyst-quality (quality gate)

FULL path:
  + dispatch: deep-analyst-planner (reads from CBP files)
  read: planner MandateResult → atomic step plan
  dispatch: impl-subagent with step plan

COMPETITIVE path:
  dispatch: deep-analyst-research
  read: research MandateResult → approach decision
  → FULL path with approach in briefing

Quality Gate:
  read: deep-analyst-quality MandateResult
  PASS → commit + close item
  FAIL → rejection-feedback loop (max 3)
  EXHAUSTED → write_escalation + report to user
```

## Key Design Constraint
The coordinator's OWN context should stay FLAT:  
Maximum: item_details + 5 MandateResults (5 × 800 tokens = 4K) + synthesis + impl-result = ~25K total

## Acceptance Criteria
- [ ] Triage decision table documented (size × complexity → tier)
- [ ] All 4 triage paths implemented
- [ ] `read_mandate_results()` replaces all `read_analysis_envelope()` calls
- [ ] Quality gate with rejection-feedback loop (max 3 iterations hardcoded)
- [ ] Escalation path documented and connected to `write_escalation()` tool
- [ ] Context budget analysis: max 25K tokens for FULL triage