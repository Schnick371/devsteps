---
agent: 'devsteps-t1-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Rapid plan-execute kanban cycles - MPD analysis, then no-ceremony continuous flow'
tools: ['vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'read', 'agent', 'edit', 'search', 'devsteps/*', , 'bright-data/*', 'todo']
---

# 🔄 Rapid Cycle

> **Reasoning:** Think through scope, risks, and approach before any action. For large or cross-cutting tasks, use extended reasoning — analyze alternatives and consequences before executing.

**Session mode: iterative.** Use `#askQuestions` at item selection and after each completion. This is the preferred mode for guide walkthroughs — the Two-Guide Pattern applies when working through a step-by-step process (see sprint prompt for the full pattern).

Activate **Standard MPD** in kanban mode. Follow the MPD protocol from your agent instructions.

## Mode Selection — T2 Dispatch

| Situation | Mode | T2 Fan-out |
|---|---|---|
| Task is clearly defined, no strategy question | **STANDARD MPD** | `t2-archaeology` + `t2-risk` → `t2-planner` |
| FULL tier (schema/cross-pkg change) | **FULL MPD** | `t2-archaeology` + `t2-risk` + `t2-quality` → `t2-planner` |
| Task asks "which approach/pattern/library" | **Competitive Mode** | `t2-research` + `t2-archaeology` → `t2-planner` |
| New tooling/library decision | **Competitive + constraints** | + `t3-aspect-constraints` + `t3-aspect-integration` |
| Single-file typo/formatting fix | **Skip Phase 0** | Direct `t2-impl` → `t2-reviewer` |

## T3 Agent Roster

**Aspect analysts** (dispatched by T2 internally — not by T1 directly):
- `t3-aspect-impact` · `t3-aspect-constraints` · `t3-aspect-quality` · `t3-aspect-staleness` · `t3-aspect-integration`

**Domain analysts** (dispatched by T2 internally):
- `t3-analyst-context` · `t3-analyst-internal` · `t3-analyst-web`

**Exec Conductors** (dispatched by T1 after `read_mandate_results` — each manages its own T3 workers):
- `t2-impl` (always) → `t2-test` (STANDARD/FULL) → `t2-doc` (FULL only)

## Kanban Pull System

- No sprint ceremonies, no time-boxing — pull when capacity available
- Feature branches short-lived (hours, max 1–2 days)
- Merge immediately after reviewer PASS

## Session Flow

1. Search for duplicates before creating items (`#mcp_devsteps_search`)
2. Create Epic → Story → Task hierarchy, link relationships
3. Select highest-priority `planned` item (Q1 → Q2 → Q3) — confirm via `#askQuestions`:
   > Next item: [ID] — [title] (Q[n]). Shall I start this, or pick a different one?
4. Update status to `in-progress`; checkout branch (`story/<ID>`, `task/<ID>`, `bug/<ID>`)
5. Run triage → dispatch T2 mandates in parallel (see Mode Selection above)
6. Synthesize MandateResults via `read_mandate_results(item_ids)` → pass `report_path` to exec agents only
7. Dispatch `t2-impl` → `t2-test` (then `t2-doc` if FULL) — pass `report_path`, never paste content
8. Execute integrated plan, quality gates, commit (`type(ID): subject` + `Implements: ID`)
9. Merge to main; mark done only after `devsteps-t2-reviewer` PASS
10. Use `#askQuestions` before pulling the next item:
    > ✅ [ID] done. Next in queue: [ID] — [title] (Q[n]). Shall I pull it, or is there a priority change?
11. Pull next item and repeat
