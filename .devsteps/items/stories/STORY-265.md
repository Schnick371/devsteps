## Goal
Add expandable Epic-level progress charts to the "Progress" tab (Project Burndown section). Each Epic gets a collapsible <details>/<summary> section showing a simplified burn-up SVG chart of its tasks' completion over time.

## Architecture
- HTML accordion: `<details class="epic-burndown"><summary>EPIC-NNN: Title (X/Y done)</summary><svg ...></svg></details>`
- **SVG not Canvas** — mandatory. Chromium inside VS Code has a 16-context limit for Canvas 2D; Epic lists can easily exceed this. SVG has no such limit.
- New file: packages/extension/src/webview/dataProviders/epicBurndownProvider.ts
  - Input: all items from loadAllData()
  - For each epic: find linked tasks (via linked_items; requires BUG-092 fix)
  - Build timeline: { date, done, total }[] per epic
- New file: packages/extension/src/webview/renderers/epicBurndownRenderer.ts
  - For each epic: generate <details> with SVG sparkline (D-like path; pure SVG, no D3)

## Dependencies
- Requires BUG-092 (linked_items loaded per node)
- Requires STORY-263 (Tab Navigation — Progress tab)

## Constraints
- SVG ONLY — no additional Canvas elements
- No new external dependencies (pure SVG path math inline)
- Epics with zero linked tasks: show "No tasks linked" placeholder

Source: analyst-research §3.2 (S3, S4, S9), analyst-risk R4, analysis-constraints, analysis-integration.

## Result
- New `epicBurndownProvider.ts` — extracts per-epic child items via `linked_items.implements`
- New `epicBurndownRenderer.ts` — SVG progress bar + `<details>` accordion
- Integrated in Progress tab below Project Burndown chart
- SVG horizontal bar (not Canvas — avoids 16-context Chromium limit)
- Child items listed with status badges, click-to-open
- Epics sorted by completion percentage descending
- Epics with zero linked items show placeholder text
- Commit: 9664dd3