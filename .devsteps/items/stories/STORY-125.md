# Story: Trim T1 Agent Files to ≤120 Lines

## Problem

Both T1 agent files exceed the 120-line limit — content in the middle gets deprioritized by the LLM:
- `devsteps-t1-coordinator.agent.md`: **148 lines** (28 over)
- `devsteps-t1-sprint-executor.agent.md`: **152 lines** (32 over)

The protocol prose (descriptions of what each step does) pushes the critical decision tables and rules toward the middle of the file where they are ignored.

## Acceptance Criteria

- [ ] `devsteps-t1-coordinator.agent.md` ≤ 120 lines — verified with `wc -l`
- [ ] `devsteps-t1-sprint-executor.agent.md` ≤ 120 lines — verified with `wc -l`
- [ ] All decision tables (Triage tier, Classification, Execution steps) retained
- [ ] Critical rules retained: HARD STOP, NEVER edit `.devsteps/`, status flow, Git standards
- [ ] Prose removed: verbose step descriptions not needed in decision tables
- [ ] Any extracted protocol detail moved to `TIER2-PROTOCOL.md` (the designated reference doc)
- [ ] `TIER2-PROTOCOL.md` updated to be ≤150 lines (currently 136, may grow slightly)
- [ ] Files start with: `description` + `Mission` (1 sentence) + Classification table immediately
- [ ] No behavior change — only compression of existing content

## Rewrite Pattern

**Remove from T1 files:**
- Narrative "why" explanations for each step (these belong in TIER2-PROTOCOL.md as reference)
- Redundant "CRITICAL:" callouts that repeat table content
- Long-form step descriptions when the table already encodes the rule

**Keep in T1 files:**
- Frontmatter (`description`, `model`, `tools`, `agents`, `handoffs`)
- Task Classification table (auto-runs before any action)
- Triage tier table (QUICK/STANDARD/FULL/COMPETITIVE)
- Execution step ordering (5 steps, one-liners only)
- HARD STOP conditions (must stay prominent)
- Item management rules (NEVER edit `.devsteps/`)
- Git standards
- Decision Surface format (⚠️ block)

## Key Constraint

The **direct prompt files work** partly because they create explicit user-message reinforcement. The agent file (system prompt) must be tight enough that the LLM reads all of it — every line matters.
