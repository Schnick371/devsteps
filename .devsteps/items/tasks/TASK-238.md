# Task: Create deep-analyst-risk Agent (Tier-2)

## Role
**Domain:** Risk analysis + constraint scoring  
**Mandate Types:** `risk` (single item), `risk-batch` (multi-item sprint)  
**Dispatches:** devsteps-analyst-constraint-analysis (Tier-3)  
**Returns:** MandateResult

## Unique Capability: Batch Mode
The `risk-batch` mandate lets Tier-1 send ALL sprint items in ONE mandate.  
This agent synthesizes risk ACROSS items — can detect:
- Cross-item conflicts (two items touching the same file)
- Accumulation risk (many "low" items adding up)
- Sequencing risk (wrong order creates merge nightmare)

## Agent Behavior

### For `risk` mandate (single item):
```
dispatch: devsteps-analyst-constraint-analysis → read envelope
Synthesize: risk_level (LOW/MED/HIGH/CRITICAL) + blocking constraints
```

### For `risk-batch` mandate (multi-item):
```
dispatch: devsteps-analyst-constraint-analysis per item (parallel, up to 10)
Read ALL envelopes via read_analysis_envelope()
Cross-item analysis:
  - File collision detection (set intersection on affected_paths)
  - Circular dependency detection
  - Sequencing recommendation (topological sort by risk)
Synthesize: risk matrix + recommended execution order
```

## MandateResult for risk-batch
```
findings: risk matrix table (per item: LOW/MED/HIGH/CRITICAL + reason)
recommendations: [
  "Execute TASK-XYZ before TASK-ABC (shared file: src/auth.ts)",
  "TASK-DEF is CRITICAL risk — schedule review checkpoint",
  "Items 3,7,9 conflict on package.json — serialize these"
]
confidence: min(all per-item confidences)
```

## Acceptance Criteria
- [ ] Agent distinguishes `risk` vs `risk-batch` mandate type
- [ ] Batch mode: parallel dispatch, max 10 concurrent subagents  
- [ ] Cross-item collision detection implemented in synthesis
- [ ] Recommended execution order included in findings (not just raw risk)