---
agent: 'devsteps-coordinator'
model: 'Claude Sonnet 4.6'
description: 'Begin implementation work - MPD analysis then structured development'
tools: [vscode, execute, read, agent, edit, search, web, 'devsteps/*', 'tavily/*', todo]
---

# 🚀 Start Work

Activate **Standard MPD**. Follow the MPD protocol from your agent instructions.

## Mode Selection

| Situation | Mode |
|---|---|
| Task is clearly defined, no strategy question | **Standard MPD** — dispatch all 5 aspect analysts in parallel |
| Task asks "which approach/pattern/library" | **Competitive Mode** — dispatch analyst-internal + analyst-web, then relevant aspects |
| Single-file typo/formatting fix | **Skip Phase 0** — execute directly |

## Entry Points

If the user specified an item ID → use that item.  
If no item specified → `#mcp_devsteps_list` filtered by `status: planned`, priority Q1 first, select highest priority.

## What to do next

1. Identify the item (ask user or select from backlog)
2. Update item status to `in-progress`
3. Create/checkout feature branch (`story/<ID>`, `task/<ID>`, `bug/<ID>`)
4. Run Phase 0 MPD — dispatch aspect analysts in parallel
5. Synthesize envelopes → Enriched Task Brief
6. Dispatch specialists (impl, test, doc) with briefing file paths — never paste full content
7. Execute integrated plan, then quality gates
8. Mark done only after `devsteps-reviewer` PASS

