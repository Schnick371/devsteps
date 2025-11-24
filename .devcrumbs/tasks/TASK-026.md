# Traceability Graph Performance - Node Limiting

## Context
SPIKE-002 identified O(n²) bottleneck in force-directed traceability graph:
- 100 nodes: ~500ms ✅
- 500 nodes: ~2-5s ⚠️
- 1,000+ nodes: **Unusable** (10s+) ❌

## Problem

Force-directed layout (`d3.forceSimulation`) runs physics calculations on **all** nodes:
- Complexity: O(n²) per iteration
- Iterations: ~300 (until stable)
- Total: **O(300n²)** operations

**Impact**: Graph becomes unresponsive at 500+ linked items.

## Solution: Intelligent Node Limiting

### Strategy 1: Show Most Connected Items (Recommended)

**Algorithm**:
1. Calculate connection score for each item (# of links)
2. Sort by score descending
3. Take top N items (configurable, default: 50)
4. Include all items directly connected to top N
5. Render limited subgraph

**Pseudocode**:
```typescript
function getLimitedTraceabilityData(allItems: Item[], maxNodes = 50): TraceabilityData {
  // Calculate connection scores
  const scores = allItems.map(item => ({
    id: item.id,
    score: Object.values(item.linked_items).flat().length
  }));
  
  // Get top N most-connected items
  const topItems = scores.sort((a, b) => b.score - a.score).slice(0, maxNodes);
  const topIds = new Set(topItems.map(i => i.id));
  
  // Include items directly connected to top items
  const connectedIds = new Set(topIds);
  allItems.filter(i => topIds.has(i.id)).forEach(item => {
    Object.values(item.linked_items).flat().forEach(id => connectedIds.add(id));
  });
  
  // Build subgraph
  const nodes = allItems.filter(i => connectedIds.has(i.id));
  const edges = []; // Build edges from linked_items
  
  return { nodes, edges, totalNodes: allItems.length, displayedNodes: nodes.length };
}
```

**Expected Performance**:
- 1K items → 50-100 nodes displayed: **~500ms** ✅ (10× faster)
- 10K items → 50-100 nodes displayed: **~500ms** ✅ (20× faster)
- User can increase limit via settings

### Strategy 2: Configurable Filter

**UI Addition**:
Add dropdown in dashboard: "Show: [Top 25] [Top 50] [Top 100] [All]"

**Settings**:
```typescript
// package.json contribution
"devcrumbs.dashboard.traceabilityMaxNodes": {
  "type": "number",
  "default": 50,
  "description": "Maximum nodes to display in traceability graph"
}
```

### Strategy 3: Static Layout Caching (Future)

**Concept**: Pre-calculate node positions, cache to disk
- First load: Calculate layout (slow)
- Subsequent loads: Read cached positions (fast)
- Invalidate cache on item changes

**Defer to**: v0.6.0 (complex implementation)

## Implementation Steps

1. **Add Node Limiting Logic**:
   - Implement `getLimitedTraceabilityData()` helper
   - Sort by connection score
   - Include connected neighbors

2. **Add Warning Banner**:
   - If `displayedNodes < totalNodes`: Show info message
   - Example: "Showing 50 of 1,234 items. [Show More] [Settings]"

3. **Add Settings Integration**:
   - Read `devcrumbs.dashboard.traceabilityMaxNodes` config
   - Default: 50 nodes
   - Range: 10-500

4. **Update Graph Rendering**:
   - Pass limited data to force simulation
   - Adjust graph legend: "Top 50 Most Connected Items"

## Testing

### Performance Benchmarks

**Test Cases**:
```bash
# Create large dataset
node packages/cli/dist/index.js bulk --count 1000

# Link items heavily
for i in {1..500}; do
  node packages/cli/dist/index.js link TASK-$i implements EPIC-001
done

# Measure graph render time (Chrome DevTools)
console.time('graph-render');
// Open dashboard, wait for graph
console.timeEnd('graph-render');
```

**Acceptance Criteria**:
- ✅ 1K items: Render <1s (was ~10s)
- ✅ 10K items: Render <1s (was unusable)
- ✅ Graph still useful (shows important connections)
- ✅ User can increase limit if needed

### Visual Regression Testing

**Manual Checks**:
1. Graph displays top N nodes
2. Edges connect correctly
3. Node colors match status (draft/done)
4. Hover tooltips show item details
5. Warning banner appears when limited
6. Settings toggle works

## Affected Files

- `packages/vscode-extension/src/webview/dashboardPanel.ts` (graph logic)
- `packages/vscode-extension/package.json` (settings contribution)
- `packages/vscode-extension/media/dashboard.css` (warning banner styles)

## Estimated Effort
**4 hours**
- 2h: Implement node limiting algorithm
- 1h: Add settings integration
- 1h: Testing and visual polish

## Dependencies
- Depends on: TASK-025 (single-load optimization)
- Implements: EPIC-003 (VS Code Extension)