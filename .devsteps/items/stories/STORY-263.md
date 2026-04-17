## Goal
Implement multi-tab navigation for the DevSteps dashboard without reassigning webview.html on every tab switch (which would invalidate the CSP nonce — constraint C-1).

## Architecture Decision (from research brief §4)
Single WebviewPanel HTML init: all tab content is rendered into the DOM on first load; CSS [data-active-view] attribute on <body> shows/hides sections.

## Tabs (5)
1. **Overview** — current stats cards + Eisenhower matrix (current default view)
2. **Work Items** — dedicated item list (scoped by STORY for Work Items tab)
3. **Progress** — Project Burndown chart + Epic accordion
4. **Traceability** — traceability graph (currently rendered eagerly; move to lazy tab)
5. **Timeline** — activity timeline

## Tab Switching
- Navigation bar: `<nav class="tab-bar">` with 5 `<button data-view="xxx">` items
- JS in inline script: `document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => { document.body.setAttribute('data-active-view', btn.dataset.view); vscode.setState({ activeView: btn.dataset.view }); }));`
- State restoration: on script load, read `vscode.getState()?.activeView` and apply
- CSS: `body:not([data-active-view='overview']) .overview-section { display: none; }` (one rule per section)

## Constraints
- MUST NOT call webview.html = ... for tab switching
- Implements/extends STORY-182 (hash routing commitment already in EPIC-040)
- STORY-182 should be marked superseded after this story, not created in parallel

## Affected files
- packages/extension/src/webview/dashboardPanel.ts — HTML template restructure
- packages/extension/media/dashboard.css — tab bar + view-toggle CSS

Source: analysis-constraints C-1, S1 (VS Code UX Guidelines), S2 (dual esbuild guide), analyst-research §3.1.

## Result
- 5-tab architecture: Overview, Work Items, Progress, Traceability, Timeline
- CSS-only view switching via `data-active-view` attribute (CSP-safe)
- `vscode.getState()/setState()` for tab persistence across webview refreshes
- ARIA `tablist/tab/tabpanel` roles for accessibility
- Commit: d676347