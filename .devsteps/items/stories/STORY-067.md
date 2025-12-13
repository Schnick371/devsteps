# Extension UI Update - Eisenhower Priority Display

## Objective
Update VS Code extension to display Eisenhower Matrix as "Priority" with correct colors.

## UI Changes

**TreeView Filters:**
- Rename "Priority Filter" menu (keep label)
- Update QuickPick options:
  - 🔴 Q1 - Urgent & Important (Do First)
  - 🟠 Q2 - Important (Schedule)
  - 🟡 Q3 - Urgent (Delegate)
  - 🟢 Q4 - Low Priority (Eliminate)

**TreeView Display:**
- Update priority badges to show Q1/Q2/Q3/Q4
- Keep color coding (🔴🟠🟡🟢)
- Update description strings

**Dashboard:**
- Update charts/statistics section
- Rename "Priority" to show Eisenhower
- Keep visual colors

**Commands:**
- Update addItem command priority picker
- Update updateStatus priority options

## Files to Update
- packages/extension/src/treeView/devstepsTreeDataProvider.ts
- packages/extension/src/commands/index.ts
- packages/extension/src/webview/dashboardPanel.ts
- packages/extension/src/decorationProvider.ts (if priority-based)

## Color Constants
Define Eisenhower colors centrally:
```typescript
const EISENHOWER_COLORS = {
  'urgent-important': '#FF0000',        // Q1 Red
  'not-urgent-important': '#FFA500',    // Q2 Orange
  'urgent-not-important': '#FFFF00',    // Q3 Yellow
  'not-urgent-not-important': '#00FF00' // Q4 Green
};
```