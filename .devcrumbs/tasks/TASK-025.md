# Dashboard Performance Optimization - Single-Load Pattern

## Context
SPIKE-002 identified critical performance bottleneck: Dashboard calls `listItems()` 5 times on every load, reading `.devcrumbs/index.json` redundantly.

**Current Impact**:
- 1K items: ~500ms (acceptable but wasteful)
- 10K items: **5-10 seconds** (unacceptable)

**Expected Improvement**: **5-10× faster** (10K items: 5s → 1s)

## Implementation

### Refactor Data Loading Pattern

**Before** (5× redundant reads):
```typescript
private async _update() {
  const stats = await this.getProjectStats();      // listItems() #1
  const eisenhower = await this.getEisenhowerData(); // listItems() #2
  const burndown = await this.getBurndownData();   // listItems() #3
  const trace = await this.getTraceabilityData();  // listItems() #4
  const activity = await this.getActivityTimeline(); // listItems() #5
}
```

**After** (1× shared load):
```typescript
private async loadAllData() {
  const devcrumbsPath = path.join(workspaceFolder, '.devcrumbs');
  const result = await listItems(devcrumbsPath);
  const allItems = result.items;
  const tasks = allItems.filter(i => i.type === 'task');
  
  return { allItems, tasks };
}

private async _update() {
  const { allItems, tasks } = await this.loadAllData();
  
  // Pass preloaded data to methods (no more async)
  const stats = this.getProjectStats(allItems);
  const eisenhower = this.getEisenhowerData(allItems);
  const burndown = this.getBurndownData(tasks);
  const trace = this.getTraceabilityData(allItems);
  const activity = this.getActivityTimeline(allItems);
  
  // Render dashboard HTML...
}
```

### Method Signature Changes

Update 5 methods to accept preloaded data:

1. **getProjectStats**: `(allItems: Item[]) => ProjectStats`
2. **getEisenhowerData**: `(allItems: Item[]) => EisenhowerData`
3. **getBurndownData**: `(tasks: Item[]) => BurndownData`
4. **getTraceabilityData**: `(allItems: Item[]) => TraceabilityData`
5. **getActivityTimeline**: `(allItems: Item[]) => ActivityData`

Remove all internal `listItems()` calls.

### Error Handling

Add graceful fallback if data loading fails:
```typescript
try {
  const { allItems, tasks } = await this.loadAllData();
  // ... render
} catch (error) {
  console.error('Dashboard data load failed:', error);
  this._panel.webview.html = this.getErrorHtml(error);
}
```

## Testing

### Performance Benchmarks

**Before/After Comparison**:
```bash
# Create test dataset (1K items)
node packages/cli/dist/index.js bulk --count 1000

# Measure dashboard load time (Chrome DevTools)
# 1. Open Command Palette → "Developer Tools"
# 2. Console: console.time('dashboard-load')
# 3. Open dashboard
# 4. Console: console.timeEnd('dashboard-load')
```

**Acceptance Criteria**:
- ✅ Load time <500ms for 1K items (was ~500ms)
- ✅ Load time <2s for 10K items (was ~5-10s)
- ✅ Memory usage unchanged (~15MB for 1K)
- ✅ All visualizations render correctly

### Regression Testing

**Manual Test Plan**:
1. Open dashboard → verify all 5 sections render
2. Check statistics cards → verify counts accurate
3. Check Eisenhower matrix → verify items in correct quadrants
4. Check burndown chart → verify data points plotted
5. Check traceability graph → verify nodes/edges displayed
6. Check activity timeline → verify last 20 updates shown
7. Filter items in matrix → verify interactivity works

## Affected Files

- `packages/vscode-extension/src/webview/dashboardPanel.ts` (primary changes)
- `packages/vscode-extension/src/webview/dashboardPanel.test.ts` (add performance tests)

## Estimated Effort
**2 hours**
- 1h: Refactor data loading pattern
- 30min: Update method signatures
- 30min: Test and validate performance

## Dependencies
- Blocks: TASK-008 (Extension Packaging - needs acceptable performance)
- Implements: EPIC-003 (VS Code Extension)