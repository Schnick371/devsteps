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


## Research Backing (Added after web research)

**Anthropic, "Effective context engineering for AI agents" (Sept 2025):**
> *"Like humans who have limited working memory capacity, LLMs have an 'attention budget' that they draw on when parsing large volumes of context."*

This directly confirms why the T1 files at 148–152 lines fail to activate protocol behavior: the critical classification tables and dispatch rules are past the primacy zone where the model's attention is highest.

**OpenAI Practical Guide to Building Agents (2025):**
> *"Keep system prompts focused and role-specific. Separate 'what you are' from 'what you do' — the role declaration goes in the agent file; the task enforcement stays in the user message."*

This supports the architecture of: tight agent files (role) + enforcement prompt files (task). The two files serve distinct purposes and must stay within their lane.

**Priority ordering within STORY-125 (confirmed by T2 Audit findings):**
- T1 coordinator: trim `Step 2: Dispatch T2 Analysts` prose (5 lines) — table already encodes this
- T1 sprint-executor: `Obsolescence Detection` table is critical — keep; `Adaptive replanning` section prose → 2-line rule
- Both: `Item Management Rules` section → move to TIER2-PROTOCOL.md (shared with T2 files)
