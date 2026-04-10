## Goal
Move the DevSteps work items list from the Overview section (where it currently doesn't exist as a distinct view) to a dedicated "Work Items" tab. This tab is revealed when the Tab Navigation Architecture (STORY-263) is in place.

## Layout
- VS Code list-row style (not card style) — monospace ID, title, type badge, status, Eisenhower label
- Filter bar at top: [All Types ▼] [All Status ▼] [All Priority ▼] (pure JS, no server round-trips)
- Click row → vscode.postMessage({ command: 'openItem', itemId }) (existing command)
- Pagination or virtual scroll for large projects (≥200 items)

## Data
- Sourced from existing allItems already loaded in loadAllData()
- Filter applied client-side in inline JS

## Dependencies
- Requires STORY-263 (Tab Navigation Architecture) to exist

Source: analyst-quality §4 (P2 UX), analyst-research §3.5.