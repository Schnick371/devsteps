# Task: Tier-2 Protocol Template — Fan-Out Pattern Dokument

## What

Erstelle `.github/agents/TIER2-PROTOCOL.md` — ein kanonisches Referenzdokument  
das das MAP-REDUCE-RESOLVE-SYNTHESIZE Pattern für alle Tier-2 Agents definiert.

Dieses Dokument wird von jedem Tier-2 Agent File referenziert: "Follow TIER2-PROTOCOL.md phases"

## Inhalt

```markdown
# Tier-2 Agent Protocol: MAP-REDUCE-RESOLVE-SYNTHESIZE

## Identity Contract (ALL Tier-2 Agents)
- I receive: Mandate (type, item_ids, triage_tier, constraints)
- I dispatch: Tier-3 agents (my sub-analysts)
- I return: MandateResult (via write_mandate_result)
- I NEVER: Edit files, execute code, make implementation decisions

## Phase 1: DECOMPOSE (local, no subagent)
Extract from Mandate:
- What specific sub-questions must be answered?
- Which T3 agent answers each sub-question?
- Are sub-questions independent? (must be for parallel dispatch)
Rule: Each sub-question → exactly ONE T3 agent. No sub-question spans multiple agents.

## Phase 2: MAP — Parallel T3 Fan-Out
> **CRITICAL: Dispatch ALL T3 agents simultaneously via #runSubagent.  
> Do NOT execute sequentially. Await ALL results before Phase 3.**

Template prompt per T3 agent:
  "You are [T3-Agent-Name]. Answer exactly one question:
   [sub-question text]
   Context: [relevant item fields]
   Write result via write_analysis_report(task_id=[item_id], aspect=[aspect])
   Confidence: explicit 0.0–1.0 value required."

## Phase 3: REDUCE — Read + Conflict Check
1. Read all T3 envelopes via read_analysis_envelope()
2. Check conflict types:
   | Conflict Type | Criterion | Action |
   |---|---|---|
   | Direct-Contradiction | Same entity, opposite truth value | Dispatch resolver (1×) |
   | Low-Confidence | Any confidence < 0.5 | Retry same T3 with more context (1×) |
   | Scope-Ordering | Two SQs disagree on order | Dispatch to t2-planner (1×) |
   | Missing-Coverage | An AC not addressed | New targeted SQ (1×) |
3. If resolver dispatch needed: parallel if multiple → await → re-evaluate
4. Hard limit: MAX 2 resolution rounds. After 2: synthesize with partial/degraded confidence.

## Phase 4: SYNTHESIZE → MandateResult
Aggregate all SQ answers:
- findings: markdown table or structured text, MAX 800 tokens
- recommendations: top-5 actionable for Tier-1, MAX 100 chars each
- confidence: min(all T3 confidences) × conflict_penalty (0.8 if any conflict, 0.6 if exhausted)
- status: "complete" | "partial" (if max rounds hit) | "escalated" (if human needed)
Call: write_mandate_result({...})

## Token Budget (per Tier-2 invocation)
- Mandate input: ~200 tokens
- T3 envelope reads (5× avg): ~750 tokens  
- Synthesis: ~300 tokens
- Total Tier-2 context: ~1250 tokens + T3 contexts (separate per subagent)

## Termination Guarantee
Even if all resolution rounds exhausted, write_mandate_result() MUST be called.
Never leave a mandate unanswered.
```

## Acceptance Criteria
- [ ] TIER2-PROTOCOL.md created in `.github/agents/`
- [ ] All 4 phases documented with actionable rules
- [ ] Conflict taxonomy table present
- [ ] Token budget documented
- [ ] Termination guarantee explicit