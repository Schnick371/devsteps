## Goal
Transform the dashboard from a bright webapp aesthetic to a developer tool / technical document aesthetic aligned with VS Code's own UI patterns.

## Changes

### 1. Remove hardcoded hex colors
All occurrences of #4caf50, #2196f3, #1e1e1e, and any other hardcoded hex in:
- packages/extension/src/webview/renderers/burndownRenderer.ts
- packages/extension/src/webview/renderers/traceabilityRenderer.ts (if not already fixed in BUG-058)
Replace with var(--vscode-charts-green), var(--vscode-charts-blue), var(--vscode-editor-background) etc.

### 2. Replace emoji headings with VS Code codicons
In dashboardPanel.ts HTML template and all renderer heading strings:
- "📉 Project Burndown" → "<span class='codicon codicon-graph-line'></span> Project Burndown" (or text-only as fallback)
- "🕸️ Traceability Graph" → codicon equivalent
- "📊 DevSteps Dashboard" → codicon or plain text
VS Code codicon font must be referenced in media/ (copy from node_modules/@vscode/codicons/dist/).

### 3. Typography normalization
- Heading <h1> font-size: 28px → 18px (IDE-style)
- Stat value font-size: 36px → 24px
- Stat label: keep 12px uppercase letter-spacing

### 4. Remove webapp hover transforms
- dashboard.css .stat-card:hover { transform: translateY(-2px); box-shadow: ... } → remove transform, keep subtle border color change only

### 5. Verify VS Code theme compliance
After changes: grep for any remaining hardcoded hex in the entire packages/extension/src/webview/ and packages/extension/media/ directories. All must be replaced.

Source: analyst-quality §3, analyst-research §3.3, S5 (GitHub Primer), S6 (VS Code 1.109 token req), S7, S8.

## Result
- Replaced all hardcoded hex colors in burndownRenderer (4 occurrences → getComputedStyle + fallback)
- Replaced hardcoded hex in traceabilityRenderer (1 occurrence → var() tokens)
- Removed emoji icons from stat cards (📊🔄✅🚫), Eisenhower heading (🔥), timeline heading (📅)
- Typography: h1 28→18px, stat-value 36→24px (IDE-aligned)
- Removed webapp hover translateY(-2px) + box-shadow, replaced with border-color transition
- All remaining hex in CSS are proper var(--vscode-*, hex) fallbacks
- Commit: d0e4999