# Refactor: Split dashboardPanel.ts (739 lines → 300-400 lines)

## Problem
**CODE QUALITY VIOLATION** (devsteps-code-standards.instructions.md):
- Current: **739 lines** (exceeds 400-line acceptable limit)
- Target: **< 300 lines** per file

## Root Cause
Single file contains multiple responsibilities:
1. WebView panel management
2. Data aggregation (stats, Eisenhower, burndown)
3. HTML generation (5 visualization sections)
4. JavaScript generation (Chart.js/D3 alternatives)
5. Styling and nonce generation

## Proposed Solution
Split into separate modules:

```
webview/
├── dashboardPanel.ts (< 300 lines) - Main panel orchestrator
├── dataProviders/
│   ├── statsProvider.ts - Project statistics
│   ├── eisenhowerProvider.ts - Eisenhower matrix data
│   ├── burndownProvider.ts - Burndown calculation
│   ├── traceabilityProvider.ts - Graph data (already optimized)
│   └── timelineProvider.ts - Timeline events
├── renderers/
│   ├── statsRenderer.ts - HTML for stat cards
│   ├── eisenhowerRenderer.ts - Matrix HTML
│   ├── burndownRenderer.ts - Canvas chart HTML + script
│   ├── traceabilityRenderer.ts - SVG graph HTML + script
│   └── timelineRenderer.ts - Timeline HTML
└── utils/
    ├── htmlHelpers.ts - escapeHtml, getNonce
    └── iconHelpers.ts - getIconForType
```

## Acceptance Criteria
- [ ] dashboardPanel.ts < 300 lines
- [ ] All visualizations working (5 sections)
- [ ] Dashboard opens without errors
- [ ] No TypeScript errors
- [ ] Build passes (esbuild bundles correctly)

## Implementation Notes
- Keep WebviewPanel lifecycle in main file
- Extract data providers as pure functions
- Separate HTML generation per section
- Maintain CSP compliance (nonce for scripts)

## References
- devsteps-code-standards.instructions.md: File size guidelines
- Current implementation: 739 lines (2.5x over recommended)
- SPIKE-002: Performance already optimized (single listItems() call)
