# Spike: Coordinator as Universal Entry Point via Prompt Specialization

## Investigation Question

Can we reduce the number of main agents by using a universal coordinator/supervisor agent that receives its domain specialization via `.prompt.md` files — effectively replacing `devsteps-maintainer`, `devsteps-documenter`, `devsteps-reviewer`, etc. with one coordinator + specialized prompts?

## Context

User question (2026-02-21): Is it possible to have fewer main agents by having the coordinator receive task context via prompts and then delegate to subagents?

## Current Verdict (from research)

**NO, not as a replacement — but YES as a layered hybrid.**

Industry consensus (VS Code docs Feb 2026, LangGraph, AutoGen, CrewAI):
- `.prompt.md` = one-shot slash command, no persistent persona, no tool restriction
- `.agent.md` = persistent persona, hard tool scoping, handoffs, model selection
- Using prompts to "specialize" a coordinator works for prototyping but not production

Specific VS Code limitation: a prompt file cannot restrict the coordinator's inherent authorization level, wire handoffs to specific subagents, or provide persistent context across messages.

## What SHOULD Be Investigated

1. **Prompt files that invoke the coordinator explicitly** (`agent: devsteps-coordinator` in frontmatter) — do our existing prompts reference the right agent?
2. **Are there main agents that are redundant** because their work is fully coverable by coordinator + existing subagents?
3. **Should more main agents have curated `agents:` whitelists** to become mini-coordinators for their domain?
4. **New subagents worth creating:**
   - `devsteps-security-subagent` (aspect of OWASP/security checks for FULL tier)
   - `devsteps-changelog-subagent` (specialist that generates CHANGELOG entries from commits/items)
   - `devsteps-build-subagent` (CI/build validation specialist)

## Time-box

4 hours max — research + decision output only, no implementation

## Definition of Done

- Written recommendation for agent roster: which to keep, which to consolidate, which new ones to add
- Decision documented in `docs/architecture/agent-roster-rationale.md`
- No code changes (spike only)