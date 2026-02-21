# Spike: Coordinator as Universal Entry Point via Prompt-Specialization

## Investigation Question

Can we reduce the number of main agents by using a universal coordinator/supervisor agent that receives its domain specialization via `.prompt.md` files — effectively replacing some `.agent.md` specialists with coordinator + specialized prompts?

## Current Understanding (2026-02-21)

### Why Standard VS Code Prompts Are "One-Shot"

In generic VS Code Copilot, `.prompt.md` = one-shot slash command: fires once, no persistent persona, no tool restriction enforcement, no handoffs. This is why the industry recommendation is specialized `.agent.md` files per role.

### Why DevSteps Prompts Are DIFFERENT — The Item-State Pattern

**DevSteps prompts are NOT generic one-shot commands.** They are parameterized by work item IDs and backed by a rich structured data source (DevSteps items via MCP tools):

```
/devsteps-20-start-work + STORY-098
    ↓
Agent pulls via devsteps/* MCP:
  - Full item description + Acceptance Criteria
  - affected_paths
  - linked items (depends-on, blocked-by, relates-to)
  - Analysis files from .devsteps/analysis/[ID]/
    ↓
Rich, re-queryable context that persists throughout the session
```

**The DevSteps item IS the persistent state.** This is architecturally analogous to LangGraph's graph state between nodes — domain specialization comes from DATA (items), not from agent identity.

This means DevSteps prompts are:
- **Reusable**: same prompt, different item ID → different domain context
- **Persistent**: state re-queryable at any point via `devsteps/get`, `devsteps/search`
- **Rich**: acceptance criteria, affected paths, linked items, analysis envelopes all available

### Hybrid Architecture: What This Enables

```
.agent.md  →  CAPABILITY specialization (tools, model, behavior patterns)
.prompt.md →  TASK specialization       (what to do, with which item)
devsteps/* →  CONTEXT persistence       (the "state" between steps, like LangGraph state)
```

DevSteps CAN viably have fewer `.agent.md` files than typical projects because item-state provides much of the domain context that other projects encode in agent personas.

## What Still Justifies Separate `.agent.md` Files

Even with item-state as the persistence layer, these dimensions require dedicated agent files:

1. **Tool Restriction** — Reviewer must not have `edit/*` tools; impl-subagent must not have `vscode/askQuestions`. This is a security/reliability boundary that prompts cannot enforce.
2. **Model Selection** — QUICK-tier items → cheaper/faster model; architecture decisions → Claude Sonnet 4.6. Only `.agent.md` can enforce model per role.
3. **Persistent Behavior Rules** — "Reviewer MUST verify all test suites before issuing PASS" is a behavioral invariant that must prepend every message in the session. Agent body text provides this.
4. **Handoffs** — Only `.agent.md` can wire VS Code handoff buttons for guided transitions.
5. **`agents:` Whitelists** — Restricting which subagents a role can call requires frontmatter, not prompts.

## What to Investigate

1. **Which current `.agent.md` files have ONLY behavioral differences** (not tool/model differences) from the coordinator? Those are candidates for consolidation via specialized prompts.

2. **Could `devsteps-documenter` and `devsteps-maintainer` be replaced** by coordinator + specialized prompts backed by DevSteps items? Their tool sets largely overlap with the coordinator's.

3. **Should new subagents be created** for genuinely distinct capability domains?
   - `devsteps-security-subagent` (OWASP/security checks, FULL tier)
   - `devsteps-changelog-subagent` (generates CHANGELOG entries from commits/items)
   - `devsteps-build-subagent` (CI/build validation specialist)

4. **Formalize the Item-State Pattern** in architecture docs — make this an official DevSteps pattern so future agents/prompts are designed around it.

## Time-box

4 hours max — research + decision output only, no implementation

## Definition of Done

- Written recommendation: which agents to keep, which to consolidate, which new ones to add
- "Item-State Pattern" formally described in `docs/architecture/mpd-architecture.md`
- Decision documented in `docs/architecture/agent-roster-rationale.md`
- No code changes (spike only)