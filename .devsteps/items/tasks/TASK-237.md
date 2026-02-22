# Task: Create deep-analyst-archaeology Agent (Tier-2)

## Role
**Domain:** Code archaeology + impact analysis  
**Reports to:** Tier-1 (sprint-executor or coordinator)  
**Dispatches:** subagents from the `analyst-*` family (code-archaeology, impact-analysis)  
**Returns:** MandateResult via `write_mandate_result`

## Mandate Types Handled
- `archaeology` — full codebase scan for an item's affected scope
- `archaeology-delta` — incremental re-analysis after partial implementation

## Agent Behavior

### Phase 1: Receive Mandate
Read CBP envelope (MandateSchema) — extract: item_ids, triage_tier, constraints

### Phase 2: Dispatch Tier-3 Analysts (parallel if multi-item)
```
ARCHAEOLOGY mandate → per item:
  - dispatch: devsteps-analyst-code-archaeology (reads all affected modules)
  - dispatch: devsteps-analyst-impact-analysis  (reads impact graph)
  both parallel via runSubagent, read via read_analysis_envelope()
```

### Phase 3: Synthesize into MandateResult
Combine both analyst outputs into:
- findings: markdown summary of affected scope + risk hotspots (< 800 tokens)
- recommendations: top-5 actionable items for Tier-1
- confidence: 0.0–1.0 based on analyst coverage

### Phase 4: Write MandateResult
Call `write_mandate_result()` with synthesis

## Token Budget
- Tier-3 dispatch overhead: included in subagent context (not this agent's budget)
- This agent's context: Mandate input + 2 read_analysis_envelope() results + synthesis = ~15K tokens
- findings output: MAX 800 tokens (enforced)

## Acceptance Criteria
- [ ] Agent file follows Tier-2 agent template (CBP envelope in, MandateResult out)
- [ ] Handles both `archaeology` and `archaeology-delta` mandate types
- [ ] Parallel dispatch of code-archaeology + impact-analysis subagents
- [ ] MandateResult confidence drops below 0.6 when analyst outputs conflict
- [ ] Token budget section documented in agent file