**Problem:** Step 5 of the current planning prompt shows only a one-liner before dispatching R4 worker-devsteps. The user has no opportunity to review what will be created, adjust priorities, remove items, or add missing ones before `mcp_devsteps_add` fires.

**Solution:** Replace Step 5 with a mandatory Pre-Create Summary Gate:
- Coord displays 5–10 lines per planned item (type, title, priority, affected paths, parent, rationale)
- Items grouped by type when multiple of the same type exist
- Followed by `#askQuestions` with options: A) Approve all B) Modify item X C) Remove item D) Add missing item E) Freetext
- R4 dispatch only fires after explicit user approval

**Acceptance criteria:**
1. Step 5 in planning prompt shows structured per-item summary before creation
2. Each item summary is 5–10 lines (type, title, priority, paths, parent, rationale)
3. Items grouped by type when multiple items of same type are planned
4. `#askQuestions` with approval options fires before any `mcp_devsteps_add`
5. All 3 prompt copies in sync (mcp-server canonical → root → cli)## Completion — 2026-03-24

Commit 8f08b62, merged to main. Step 5 now requires a structured pre-create summary (5-10 lines per item, grouped by type) + #askQuestions approval gate before any R4 dispatch. All 3 copies synced.