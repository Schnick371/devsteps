# Index Rebuild: Regenerate from Item Files

## User Story
As a **DevSteps user**, I want **to rebuild the index from item files** so that **I can recover from index corruption or inconsistencies**.

## Background
Refs-style index consists of many small files (`.devsteps/index/by-*/`). If corrupted, damaged, or inconsistent, users need a way to rebuild from source of truth (item files).

**Source of Truth:** Item files (`.devsteps/items/*/*.json`)
**Derived Data:** Index files (`.devsteps/index/*/*.json`)

## Acceptance Criteria

### Doctor Command Integration
- [ ] `devsteps doctor --fix` rebuilds all index files
- [ ] `devsteps doctor --rebuild-index` dedicated command
- [ ] Shows diff before applying changes
- [ ] Requires confirmation (or `--yes` flag)

### Rebuild Logic
- [ ] Scan all item files in `.devsteps/items/*/`
- [ ] Extract: id, type, status, priority from each
- [ ] Group items by type, status, priority
- [ ] Write to index files: `by-type/*.json`, `by-status/*.json`, `by-priority/*.json`
- [ ] Preserve metadata: `updated`, `version` timestamps

### Validation
- [ ] Before: Count items in old index (if exists)
- [ ] After: Count items in new index
- [ ] Report: Added, removed, unchanged
- [ ] Fail if item files are corrupt/missing

### User Experience
- [ ] Progress indicator for large projects (>1000 items)
- [ ] Clear success/failure messages
- [ ] Backup old index before rebuilding
- [ ] Dry-run mode: `--check` (show what would change)

## Technical Notes

**Rebuild Flow:**
```typescript
export async function rebuildIndex(devstepsDir: string, options?: {
  backup?: boolean;
  dryRun?: boolean;
}): Promise<RebuildResult> {
  // 1. Backup existing index
  if (options?.backup !== false) {
    await backupIndex(devstepsDir);
  }
  
  // 2. Scan all item files
  const items = await loadAllItems(devstepsDir);
  
  // 3. Group by type, status, priority
  const byType = groupBy(items, 'type');
  const byStatus = groupBy(items, 'status');
  const byPriority = groupBy(items, 'eisenhower');
  
  // 4. Write index files (if not dry-run)
  if (!options?.dryRun) {
    await writeIndexByType(devstepsDir, byType);
    await writeIndexByStatus(devstepsDir, byStatus);
    await writeIndexByPriority(devstepsDir, byPriority);
  }
  
  return {
    total: items.length,
    byType: Object.keys(byType).length,
    byStatus: Object.keys(byStatus).length,
    success: true
  };
}
```

**User Messages:**
```bash
$ devsteps doctor --rebuild-index

🔍 Scanning item files...
   Found: 290 items across 7 types

📊 Current index state:
   by-type:     7 files (289 items)  ⚠️  -1 item
   by-status:   8 files (290 items)  ✅  OK
   by-priority: 4 files (288 items)  ⚠️  -2 items

⚠️  Index inconsistencies detected!

🔧 Rebuild plan:
   ✅ Backup current index → index.backup-2025-12-13
   🔄 Regenerate by-type indexes
   🔄 Regenerate by-status indexes
   🔄 Regenerate by-priority indexes

Proceed? [y/N]: y

✅ Index rebuilt successfully!
   Total: 290 items
   Files: 19 index files created
```

## Use Cases

**Use Case 1: Corrupted Index**
- User manually edits index file (bad idea, but happens)
- Index now inconsistent with item files
- Solution: `devsteps doctor --rebuild-index`

**Use Case 2: Git Merge Conflict**
- Despite refs-style structure, rare conflicts possible
- User unsure how to resolve manually
- Solution: `devsteps doctor --fix` (auto-resolves by rebuilding)

**Use Case 3: Migration Verification**
- User migrated from old to new index
- Wants to verify correctness
- Solution: `devsteps doctor --rebuild-index --check` (dry-run)

## Affected Paths
- `packages/shared/src/core/index-rebuild.ts` (core logic)
- `packages/cli/src/commands/doctor.ts` (CLI integration)
- `packages/mcp-server/src/tools/doctor.ts` (optional MCP tool)

## Dependencies
- Depends on: STORY-069 (Foundation with core operations)
- Required by: Users, data integrity

## Success Criteria
- Rebuild completes in <5 seconds (290 items)
- Zero data loss
- Works with 10,000+ items
- Clear user guidance

## Definition of Done
- Core rebuild logic implemented
- CLI command integrated
- Tests: corrupt index, missing index, large project
- Documentation: "Recovering from Index Corruption"
- User guide updated