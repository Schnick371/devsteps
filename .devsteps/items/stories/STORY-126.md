# Story: Rewrite Prompt Files as Behavioral Enforcement Scripts

## Core Dilemma (Research-Confirmed)

The user cannot give the same prompt twice and get consistent deep reasoning. Root causes (from subagent audit + Red Hat 2026 article):

1. **No auto-classifier at entry point.** The planning prompt's `> **Reasoning:** Think through scope...` blockquote says "for large tasks use extended reasoning" — but does NOT link "large task" to "run bright-data". The model cannot infer this connection reliably.
2. **All steps equally mandatory.** Step 3 ("Research First — MANDATORY") has the same visual weight as "Create Items" and "Validate". No binary escape valve for trivial tasks → model either applies everything (slow) or learns to ignore MANDATORY labels (silent skip).
3. **Agent file never read.** `devsteps-40-sprint.prompt.md` says "activate sprint executor" but never says `#file:.github/agents/devsteps-t1-sprint-executor.agent.md`. The model names the agent and inlines the logic.
4. **Tool names absent from body.** `#runSubagent`, `#mcp_devsteps_read_mandate_results`, `#bright-data` all appear in frontmatter `tools:` but NEVER in the prompt body — Copilot only activates these when named explicitly.

**Named Principle: The "Big vs Small Prompt" Law** (Red Hat Engineering, Feb 2026):
> *"A single large prompt contains context for ALL possible paths, which the model must maintain across the whole conversation. Smaller, step-specific prompts inject only the context needed for each decision point."*
The planning prompt (233 lines) is a "big prompt" trying to cover all complexity levels simultaneously. Solution: add a binary complexity classifier at the top, then let agent files carry the step-specific protocols.

**Named Principle: Conditional Trigger Law** (subagent audit, Feb 2026):
> Prompt files need an **escape valve** — a binary decision that fires at line 1, before any step enumeration. Without it, the model either (a) applies all MANDATORY steps indiscriminately, or (b) learns they are aspirational and skips them silently.

---

## Problem

Prompt files are passive description, not active enforcement:
- `devsteps-40-sprint.prompt.md` (37 lines): activates agent by name only — no agent file read, no `#runSubagent`, no `read_mandate_results`, no `bright-data`
- `devsteps-10-plan-work.prompt.md` (233 lines): spec document, 83 lines over limit, no complexity classifier, no escape valve
- `devsteps-20-start-work.prompt.md` (73 lines): acceptable length but missing MUST-DO section, explicit `#runSubagent`, and `bright-data` trigger

---

## Solution: Conditional Auto-Classify Trigger

**The 1-line fix that solves the dilemma (place at top of planning prompt, replacing current blockquote):**

```markdown
> **Auto-classify before acting:**
> **(A) Trivial** — isolated change, config value, single-file fix → skip research, go straight to branch prep.
> **(B) Complex** — cross-cutting, tech/library choice, pattern unification, 3+ components, or uncertain → run `#bright-data` web research + `#context7` docs lookup FIRST, synthesize findings before creating any work item. When uncertain, classify as Complex.
```

This solves the dilemma because:
- Trivial tasks get a named escape path → no wasted research
- Complex tasks get explicit tool names → Copilot activates them
- "When uncertain, classify as Complex" closes the skip-shortcut

---

## Acceptance Criteria

### `devsteps-10-plan-work.prompt.md` — trim 233 → ≤120 lines
- [ ] **Auto-classify trigger** at top (replaces current reasoning blockquote) — 3 lines
- [ ] Remove: "Why Planning Needs Full Scope" prose (→ lives in T2-archaeology agent)
- [ ] Remove: Functional Definition + Complete Discovery detail (→ T2-archaeology)
- [ ] Remove: Truth Source Validation, Best Practice Definition (→ T2-planner)
- [ ] Remove: Validation Checklist (→ T2-reviewer)
- [ ] Remove: "WHY Hierarchy Matters" justifications (→ coordinator agent)
- [ ] Keep: Branch prep steps, commit discipline, bug clustering, reuse-before-create
- [ ] Keep: Hierarchy rules (compress from 20→7 lines)
- [ ] Keep: Spike→Story Transition (compress from 22→8 lines)
- [ ] Keep: Steps 5–9 (compress from 30→13 lines)
- [ ] Target: ~90 lines (30-line margin for future additions)

### `devsteps-40-sprint.prompt.md` — add enforcement, 37 → ~60 lines
- [ ] Add `## ⚠️ MANDATORY PROTOCOL` section IMMEDIATELY after h1 heading (primacy zone, lines 1–30)
- [ ] Add `STEP 0`: `#file:.github/agents/devsteps-t1-sprint-executor.agent.md` — read first
- [ ] Add behavioral rules table: `#runSubagent` (T2 only), `read_mandate_results` (never raw T3), `#bright-data` (COMPETITIVE/spike), parallel fan-out (one call)
- [ ] Add Pre-Sprint Checklist (6 items — agent read, backlog loaded, T2 dispatched parallel, MandateResults read, Sprint Brief written, obsolescence pass)
- [ ] 23 lines added → total ≤ 60 lines

### `devsteps-20-start-work.prompt.md` — add MUST-DO, 73 → ≤87 lines
- [ ] Add `## ⚠️ MUST-DO BEFORE ANY TOOL CALL` immediately after `> **Reasoning:**` blockquote
- [ ] Add `STEP 0`: `#file:.github/agents/devsteps-t1-coordinator.agent.md`
- [ ] Add rules table: `#runSubagent`, `NEVER paste T3 envelope`, `#bright-data` for COMPETITIVE, parallel fan-out
- [ ] 14 lines added → total ≤ 87 lines

### All three prompts
- [ ] Every prompt explicitly names `#runSubagent`, `#mcp_devsteps_read_mandate_results`, and `#bright-data` in the body (not just frontmatter tools list)
- [ ] Every prompt starts with either the auto-classify trigger (planning) or the agent-file read gate (sprint/start) in the first 30 lines

---

## Research Backing

**Red Hat Developer Blog (Feb 23, 2026) — "Prompt Engineering: Big vs Small Prompts for AI Agents":**
> Multi-step workflows need step-specific context injection, not one massive prompt covering all paths. The big prompt approach requires larger, more expensive models and fails to focus the agent on the current decision point.
Source: https://developers.redhat.com/articles/2026/02/23/prompt-engineering-big-vs-small-prompts-ai-agents

**Subagent audit (T3-internal, Feb 25, 2026):**
- `devsteps-40-sprint.prompt.md`: all four critical behaviors absent (`#runSubagent`, `read_mandate_results`, agent file read, `#bright-data`)
- `devsteps-10-plan-work.prompt.md`: no complexity classifier, no conditional escape valve, research instruction buried at step 3 of 9 with identical visual weight to trivial steps
- `devsteps-20-start-work.prompt.md`: tools named in frontmatter only — body never mentions them; MUST-DO section entirely absent

**Anthropic — "Effective Context Engineering for AI Agents" (Sept 2025) — Attention Budget Law:**
> Content in the middle of long files is systematically deprioritized. Current planning prompt: 234 lines, research instruction at line 60 — in the attention dead zone.

## Line Budget Summary

| File | Current | Target | Net Change |
|---|---|---|---|
| `devsteps-10-plan-work.prompt.md` | 233 | ≤120 | −113 lines |
| `devsteps-40-sprint.prompt.md` | 37 | 55–70 | +18–33 lines |
| `devsteps-20-start-work.prompt.md` | 73 | ≤87 | +14 lines |
