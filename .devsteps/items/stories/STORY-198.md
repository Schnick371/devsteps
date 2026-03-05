## Context
LangGraph Studio and Langfuse have announced VS Code integrations targeting Q2–Q3 2026. DevSteps can ship a competitive agent topology visualization using EXISTING `.devsteps/cbp/` MandateResult files — no new VS Code APIs needed.

## Scope
Add a "Spider Web" tab to the existing webview dashboard (`packages/extension/src/webview/`):
- Renders a Gantt-style ring timeline: Ring 0 (coord) at centre, Ring 1–5 radiating outward
- Each analyst/exec agent gets a swimlane with duration bar (using `duration_ms` from enriched schema)
- Tab appears only when CBP data exists for current sprint (`/cbp/<sprint-id>/` directory)
- Reads CBP files via `vscode.workspace.fs` — no new file watchers
- Vanilla SVG rendering — zero new npm dependencies

## Acceptance Criteria
- Spider Web tab appears in dashboard when CBP data present
- Rings render with correct agent assignments
- Duration bars reflect actual `duration_ms` values