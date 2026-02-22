# Task: Create deep-analyst-quality Agent (Tier-2) + Upgrade devsteps-reviewer to Tier-2

## Role
**Domain:** Quality review + structured rejection  
**Mandate Type:** `quality-review`  
**Dispatches:** devsteps-reviewer (Tier-3, for deep code analysis)  
**Returns:** MandateResult (if PASS) OR writes RejectionFeedback + returns MandateResult(status:"partial")

## Two-Phase Quality Gate

### Phase 1: Automated Checks (in-agent, no subagent needed)
Run directly in this agent's context (NO subagent overhead for simple checks):
- File exists as expected (affected_paths from implementation result)
- TypeScript compilation: `npx tsc --noEmit` 
- Lint: `npx biome check`
- Test run: `npx vitest run` (parse output for failures)

If ALL pass → skip Phase 2, write MandateResult(status: "complete", confidence: 0.95)

### Phase 2: Deep Review (if automated checks pass but quality gate requires deeper review)
```
dispatch: devsteps-reviewer subagent → reads implementation + test files
read: read_analysis_envelope(reviewer result)
Synthesize: quality verdict
```

**PASS criteria:**
- Reviewer score ≥ 7/10
- No blocking issues (type safety violations, missing error handling)
- Test coverage meets story acceptance criteria

**FAIL → writes RejectionFeedback**: structured list of specific_issues (file + line + suggestion)

## Reviewer Agent Upgrade (Tier-2 Aware)
Update `devsteps-reviewer.agent.md`:
- Output: `write_analysis_report()` as today (Tier-3 protocol unchanged)
- Add: Enforced score format: `VERDICT: [PASS|FAIL] SCORE: N/10`
- Add: structured `blocking_issues: []` section in analysis report
- Reason: deep-analyst-quality needs machine-parseable output from reviewer

## Acceptance Criteria
- [ ] Phase 1 automated checks run BEFORE dispatching reviewer subagent
- [ ] Phase 2 subagent dispatch only when automated checks pass
- [ ] `write_rejection_feedback()` called with iteration tracking when FAIL
- [ ] Reviewer agent output updated with parseable VERDICT line
- [ ] Loop bound: max 3 review-fix iterations hardcoded in this agent