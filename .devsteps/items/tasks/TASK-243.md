# Task: Rewrite sprint-executor Agent as True Tier-1 Masteragent

## Core Transformation

Today: sprint-executor reads archaeology envelopes directly (context explosion for 10+ items)  
After: sprint-executor ONLY reads MandateResults — Tier-2 handles all synthesis

## New Architecture

### Sprint Initialization Phase (parallel)
```
dispatch: deep-analyst-risk        (mandate: "risk-batch", all items)
dispatch: deep-analyst-archaeology (mandate: "archaeology-delta" if warm cache, else skip)
dispatch: deep-analyst-planner     (mandate: "planning", reads results of above)
→ all 3 parallel via runSubagent
→ wait for all 3 MandateResults via read_mandate_results()
→ extract: execution order, risk checkpoints, budget estimate
```

### Per-Item Execution Phase
```
for each item in execution_order:
  switch to feature branch
  
  if triage == QUICK:
    dispatch impl-subagent directly (no analysis needed)
  if triage == STANDARD:
    dispatch deep-analyst-archaeology (single item) + deep-analyst-risk (parallel)
    read MandateResults → briefing context
    dispatch impl-subagent with briefing
  if triage == FULL:
    + dispatch deep-analyst-planner (reads archaeology + risk MandateResults)
    read planner MandateResult → atomic step plan
    dispatch impl-subagent with step plan
  if triage == COMPETITIVE:
    dispatch deep-analyst-research first
    read research MandateResult → approach decision
    then FULL path with approach decision in briefing
  
  Quality gate:
    dispatch deep-analyst-quality (mandate: "quality-review")
    read MandateResult:
      status == "complete" → merge
      status == "partial" → rejection-feedback loop (max 3)
      status == "escalated" → write_escalation() + pause
```

### Adaptive Replanning (every 5 items)
```
read all MandateResults so far → check cumulative drift
dispatch deep-analyst-planner (mandate: "planning-rerank")
adjust remaining execution order
```

## Token Budget Target
Tier-1 context per item: < 30K tokens  
(Was: 50+ envelopes → unlimited. Now: 5 MandateResults × 800 tokens = 4K overhead)

## Acceptance Criteria
- [ ] NEVER reads `read_analysis_envelope()` directly (only `read_mandate_results()`)
- [ ] All 4 triage tiers implemented with correct mandate dispatch
- [ ] Adaptive replanning every 5 items
- [ ] Escalation handling: writes escalation, awaits user input
- [ ] Context budget documented: target < 30K tokens per item in Tier-1