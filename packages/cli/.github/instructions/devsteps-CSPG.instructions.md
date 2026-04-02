---
applyTo: ".github/agents/devsteps-R0-coord*.agent.md,.github/prompts/devsteps-*.prompt.md,.github/agents/devsteps-R3*.agent.md"
description: "Coordinator-Synthesized Pre-Planning Gate (CSPG) — structured question protocol for coord agents"
---

# CSPG — Coordinator-Synthesized Pre-Planning Gate

## Purpose

The CSPG is the ONLY sanctioned mechanism for coord agents to surface questions to the user mid-flow. It enforces two invariants:
1. All human questions are batched, context-rich, and presented ONCE per gate point
2. R1/R2/R3 agents NEVER ask users questions — coord owns all human interaction

---

## Gate Points (coord only)

### Gate A — Pre-Planning (before exec-planner dispatch)

**Trigger:** After ALL Ring 1+2 MandateResults are collected

**Protocol:**
1. Compile all ambiguities across Ring 1+2 findings (scope gaps, constraint conflicts, approach choices, priority decisions)
2. If ambiguities exist:
   - Display a structured overview FIRST — bullet list or table showing each topic, its implication, and the available options
   - Then call `#askQuestions` ONCE — use numbered questions for independent decisions AND multiple-choice options for each decision point
   - Collect answers, embed in exec-planner dispatch context
3. If no ambiguities: skip Gate A entirely — dispatch exec-planner immediately

**Format for overview (required before #askQuestions):**
```
## Decision Points before Planning

| # | Topic | Implication | Options |
|---|-------|-------------|---------|
| 1 | ... | ... | A) ... / B) ... |
```

### Gate B — Post-Planner Fallback (exec-planner returns NEEDS_CLARIFICATION)

**Trigger:** exec-planner MandateResult has `verdict=NEEDS_CLARIFICATION`

**Protocol:**
1. Extract `findings.clarification_needed[]` items
2. Display summary of planner's decision points (same table format as Gate A)
3. Call `#askQuestions` ONCE with answers embedded on re-dispatch
4. If exec-planner returns `NEEDS_CLARIFICATION` a second time → `write_escalation`, surface to user, STOP

### Gate C — Post-Sprint (after gate-reviewer PASS and merge)

**Trigger:** New blockers or replanning needs discovered during Ring 4 execution

**Protocol:**
1. Display clear summary: what was completed, what blocker/replanning need arose
2. Present available options (numbered or multiple-choice)
3. Call `#askQuestions` ONCE — then proceed autonomously with the answer

---

## NEEDS_CLARIFICATION Verdict (exec-planner only)

When exec-planner cannot determine the correct approach without human input:

```json
{
  "verdict": "NEEDS_CLARIFICATION",
  "confidence": 0.5,
  "findings": {
    "clarification_needed": [
      {
        "question": "Should the API be synchronous or streaming?",
        "context": "Archaeology found 2 existing patterns; Risk flagged streaming as HIGH risk for current infra",
        "options": ["A) Synchronous (safer, 3 files changed)", "B) Streaming (future-proof, 8 files changed)"],
        "default": "A"
      }
    ]
  }
}
```

---

## Invariants

- Gate A fires BEFORE exec-planner — not after (Gate B handles post-planner fallback)
- Each gate fires AT MOST ONCE per sprint/item cycle
- Overview display is MANDATORY before any `#askQuestions` call
- Multiple-choice options MUST be included for every decision with >1 viable path
- Coord NEVER asks in free-form chat outside a gate — always structured table + `#askQuestions`
