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
