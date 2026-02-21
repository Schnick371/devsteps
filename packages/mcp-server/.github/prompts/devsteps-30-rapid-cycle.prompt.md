---
agent: 'devsteps-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Rapid plan-execute kanban cycles - MPD analysis, then no-ceremony continuous flow'
tools: ['think', 'vscode/runCommand', 'execute/runInTerminal', 'execute/getTerminalOutput', 'execute/runTask', 'execute/awaitTerminal', 'execute/killTerminal', 'read', 'agent', 'edit', 'search', 'web', 'devsteps/*', 'tavily/*', 'todo']
---

# 🔄 Rapid Cycle

Activate **Standard MPD** in kanban mode. Follow the MPD protocol from your agent instructions.

## Mode Selection

| Situation | Mode |
|---|---|
| Task is clearly defined, no strategy question | **Standard MPD** — dispatch all 5 aspect analysts in parallel |
| Task asks "which approach/pattern/library" | **Competitive Mode** — dispatch analyst-internal + analyst-web, then relevant aspects |
| New tooling/library decision | **Competitive + constraints + integration** aspects |
| Single-file typo/formatting fix | **Skip Phase 0** — execute directly |

## Kanban Pull System

- No sprint ceremonies, no time-boxing — pull when capacity available
- Feature branches short-lived (hours, max 1–2 days)
- Merge immediately after reviewer PASS

## Session Flow

1. Search for duplicates before creating items (`#mcp_devsteps_search`)
2. Create Epic → Story → Task hierarchy, link relationships
3. Select highest-priority `planned` item (Q1 → Q2 → Q3)
4. Update status to `in-progress`; checkout branch (`story/<ID>`, `task/<ID>`, `bug/<ID>`)
5. Run Phase 0 MPD — all aspect analysts in parallel
6. Synthesize envelopes → Enriched Task Brief
7. Dispatch specialists with briefing file paths — never paste full content
8. Execute integrated plan, quality gates, commit (`type(ID): subject` + `Implements: ID`)
9. Merge to main; mark done only after `devsteps-reviewer` PASS
10. Pull next item and repeat
