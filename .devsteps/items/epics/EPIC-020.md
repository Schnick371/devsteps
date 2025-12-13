# Complete Refs-Style Index Migration Across All Packages

## Problem Statement

STORY-079 migrated `.devsteps/` to use refs-style index (git-inspired object store), but **only updated shared package core functions**. All consumer packages (extension, mcp-server, cli) still read old monolithic `index.json`.

## Current State (BROKEN)

**Legacy index:** `.devsteps/index.json` (removed by STORY-079)  
**New refs-style index:** `.devsteps/index/by-type/*.json`, `by-status/*.json`, `by-priority/*.json`

### Affected Locations (15+ files)

**1. Extension TreeView (2 files):**
- `packages/extension/src/treeView/nodes/hierarchyRootNode.ts` - ❌ Reads old index
- `packages/extension/src/treeView/devstepsTreeDataProvider.ts` - ⚠️ May use old index

**2. Extension Embedded MCP Server (4 files):**
- `packages/extension/src/mcp-server/handlers/init.ts` - ❌ Writes old index
- `packages/extension/src/mcp-server/handlers/status.ts` - ❌ Reads old index
- `packages/extension/src/mcp-server/handlers/export.ts` - ❌ Reads old index
- `packages/extension/src/mcp-server/handlers/search.ts` - ❌ Reads old index

**3. Standalone MCP Server (4 files):**
- `packages/mcp-server/src/handlers/init.ts` - ❌ Writes old index
- `packages/mcp-server/src/handlers/status.ts` - ❌ Reads old index
- `packages/mcp-server/src/handlers/export.ts` - ❌ Reads old index
- `packages/mcp-server/src/handlers/search.ts` - ❌ Reads old index

**4. CLI (5 locations):**
- `packages/cli/src/commands/init.ts` - ❌ Writes old index
- `packages/cli/src/commands/index.ts` (3 occurrences) - ❌ Reads old index
- `packages/cli/src/commands/doctor.ts` - ❌ Reads old index
- `packages/cli/src/commands/context.ts` - ❌ Reads old index

## Impact

**Critical Regressions:**
- ✅ **STORY-079**: Items migration works (shared package)
- ❌ **Hierarchical TreeView**: Empty (BUG-036)
- ❌ **MCP Tools**: May fail or use stale data
- ❌ **CLI Commands**: `status`, `list`, `search`, `doctor`, `context` broken
- ❌ **New projects**: `init` creates wrong index structure

**Severity:** CRITICAL - Most functionality broken in 0.8.1-next.1

## Solution Strategy

### Phase 1: Shared Package (✅ Done)
- ✅ `index-refs.ts`: Load/save refs-style index
- ✅ `auto-migrate.ts`: Detect and migrate old index
- ✅ Export migration functions from `core/index.ts`

### Phase 2: Extension (Stories)
- Update TreeView to use refs-style index
- Update embedded MCP server handlers
- Remove duplicate code (DRY - use shared package)

### Phase 3: MCP Server (Stories)
- Update all handlers to use shared package functions
- Remove custom index logic
- Add auto-migration on startup

### Phase 4: CLI (Stories)
- Update all commands to use shared package functions
- Remove custom index logic
- Update `init` command to create refs-style index

### Phase 5: Testing & Documentation
- Test migration path (old → new)
- Update docs with new index structure
- Verify all commands work

## Success Criteria

- ✅ All packages use refs-style index
- ✅ No code reads/writes `.devsteps/index.json`
- ✅ Auto-migration works (old projects → new index)
- ✅ New projects created with refs-style index
- ✅ All TreeView modes work (flat + hierarchical)
- ✅ All MCP tools work
- ✅ All CLI commands work
- ✅ Documentation updated

## Breaking Changes

**For Users:**
- Auto-migration on first run (transparent)
- Old index archived to `.devsteps/archive/index.json`

**For Developers:**
- Must use shared package functions (`loadIndexByType`, etc.)
- Cannot directly read `index.json` anymore

## Related

- **STORY-079**: Introduced refs-style index (shared package only)
- **BUG-036**: Hierarchical view empty (first discovered regression)
- **TASK-198**: Fix hierarchyRootNode (tactical fix, part of this epic)

---

## CRITICAL UPDATE: Architecture Problem Discovered

### Root Cause Analysis (Deeper Investigation)

**Problem ist NICHT nur Migration, sondern Code-Duplizierung!**

**Timeline:**
1. **v0.1-v0.6:** Extension/MCP/CLI erstellt → lesen direkt `index.json`
2. **v0.8 (STORY-079):** shared package migriert zu refs-style index
3. **FEHLER:** Extension/MCP/CLI **nicht refactored** → nutzen alte Logik

**Aktueller Zustand:**
```typescript
// ❌ Extension/MCP/CLI (dupliziert in 15+ Files)
const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf-8'));
const items = index.items.filter(i => i.type === 'epic');
const stats = { total: index.stats.total, ... };

// ✅ shared package (bereits vorhanden!)
import { loadIndexByType, getItemCounts } from '@schnick371/devsteps-shared';
const items = loadIndexByType(devstepsDir, 'epic');
const stats = getItemCounts(devstepsDir);
```

### This is NOT "Change Path" - It's Refactoring!

**Wrong Approach:** "index.json → by-type/epics.json" (10 lines per file)  
**Right Approach:** "Remove custom logic → Use shared functions" (50-100 lines per file)

**Example: status Handler**

Before (100 lines custom logic):
```typescript
const index = JSON.parse(readFileSync(indexPath, 'utf-8'));
const staleItems = index.items.filter(item => {
  if (item.status === 'in-progress') {
    const days = (Date.now() - new Date(item.updated).getTime()) / (1000*60*60*24);
    return days > 7;
  }
});
const byStatus = {};
for (const item of index.items) {
  if (!byStatus[item.status]) byStatus[item.status] = [];
  byStatus[item.status].push(item);
}
```

After (5 lines with shared):
```typescript
import { loadIndexByStatus, getItemCounts, getRecentUpdates } from '@schnick371/devsteps-shared';
const inProgressItems = loadIndexByStatus(devstepsDir, 'in-progress');
const staleItems = inProgressItems.filter(item => /* stale check */);
const stats = getItemCounts(devstepsDir);
```

### Benefits of Refactoring

- ✅ **DRY Principle:** No code duplication
- ✅ **Single Source of Truth:** Only shared has index logic
- ✅ **Maintainability:** Changes only in shared package
- ✅ **Consistency:** All packages use same logic
- ✅ **Bug Resistance:** One fix → all packages benefit
- ✅ **Auto-Migration:** shared handles migration automatically
- ✅ **Code Reduction:** Delete 500-1000 lines duplicate code

### Updated Scope

**STORY-080/081/082 are MUCH BIGGER:**
- Original estimate: ~10 lines per file
- Actual: 50-100 lines per file (logic refactoring)
- Not just path change, but handler rewrite

**Complexity increase:** 5-10x more work than initially estimated

**But:** Correct architecture, worth the investment!
