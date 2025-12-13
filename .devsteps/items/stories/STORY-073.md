# External Project Migration: Auto-Detect and Upgrade

## User Story
As a **DevSteps user with existing projects**, I want **automatic detection and migration of old index.json** so that **I can upgrade seamlessly without manual intervention**.

## Background
Users may have:
1. Projects created before refs-style index (only `index.json`)
2. Projects from other teams/repos with old structure
3. Cloned projects that haven't been migrated yet

**Current STORY-071** migrates our main project, but doesn't handle external projects!

## Acceptance Criteria

### Auto-Detection
- [ ] On CLI/MCP server startup: Check for `.devsteps/index.json`
- [ ] If exists AND `.devsteps/index/` missing → Trigger auto-migration
- [ ] Log migration process to console
- [ ] Create backup: `index.json.pre-migration-{timestamp}`

### Migration Command
- [ ] `devsteps migrate` - Manual migration trigger
- [ ] `devsteps migrate --check` - Dry-run, show what would change
- [ ] `devsteps migrate --skip-backup` - Advanced users only
- [ ] Exit code 0 on success, non-zero on failure

### Graceful Degradation
- [ ] If both old and new index exist: Use new, ignore old
- [ ] If only old index exists: Trigger auto-migration on first write
- [ ] If neither exists: Create new refs-style index
- [ ] Clear user messages for each scenario

### Validation
- [ ] Verify item count before/after migration
- [ ] Verify all IDs migrated successfully
- [ ] Check consistency across all new index files
- [ ] Rollback on validation failure

## Technical Notes

**Auto-Migration Flow:**
```typescript
// In shared/core/index-operations.ts
export async function ensureIndexMigrated(devstepsDir: string): Promise<void> {
  const oldIndex = join(devstepsDir, 'index.json');
  const newIndex = join(devstepsDir, 'index');
  
  if (await exists(oldIndex) && !await exists(newIndex)) {
    console.log('🔄 Migrating to refs-style index...');
    await migrateIndex(devstepsDir);
    console.log('✅ Migration complete!');
  }
}

// Call in CLI/MCP before any operation
await ensureIndexMigrated(devstepsDir);
```

**User Messages:**
```
📦 DevSteps Project Detected
🔍 Old index.json found (290 items)
🆕 New refs-style index not found
🔄 Auto-migrating to improved index structure...
   ✅ Backed up to: index.json.pre-migration-2025-12-13
   ✅ Created by-type indexes (7 files)
   ✅ Created by-status indexes (8 files)
   ✅ Created by-priority indexes (4 files)
   ✅ Verified: 290/290 items migrated
✨ Migration complete! Zero merge conflicts ahead.
```

## Affected Paths
- `packages/shared/src/core/migration.ts` (auto-detection)
- `packages/cli/src/commands/migrate.ts` (manual command)
- `packages/mcp-server/src/index.ts` (startup check)

## Dependencies
- Depends on: STORY-071 (Migration script exists)
- Required by: External users, team collaboration

## Success Criteria
- Zero manual steps for users
- Clear, reassuring messages
- Backup created automatically
- Rollback possible if issues
- Works for projects with 1-10,000 items

## Definition of Done
- Auto-detection implemented in shared
- CLI `migrate` command works
- MCP server auto-migrates on startup
- Tests with old project structure
- Documentation updated
- User guide: "Migrating from v1.x to v2.0"