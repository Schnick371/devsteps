# Migration: Transform index.json to Refs-Style Structure

## User Story
As a **DevSteps project maintainer**, I want **a safe migration from monolithic index.json to refs-style indexes** so that **existing data is preserved and the transition is smooth**.

## Background
After all packages support new index (STORY-070), migrate existing `.devsteps/index.json` (290 items, 2134 lines) to new distributed structure with zero data loss.

## Acceptance Criteria

### Migration Script
- [ ] Create `scripts/migrate-index.ts` (or .js)
- [ ] Read existing `.devsteps/index.json`
- [ ] Parse all items (validate schema)
- [ ] Group items by type, status, priority
- [ ] Write to `index/by-type/*.json`
- [ ] Write to `index/by-status/*.json`
- [ ] Write to `index/by-priority/*.json`
- [ ] Verify all items migrated (count check)

### Data Validation
- [ ] Pre-migration item count
- [ ] Post-migration item count (must match)
- [ ] Checksum verification (all IDs present)
- [ ] No duplicates across indexes
- [ ] No orphaned items
- [ ] Consistency check across all index files

### Backup Strategy
- [ ] Backup `.devsteps/index.json` → `index.json.backup-{timestamp}`
- [ ] Keep backup for 30 days
- [ ] Document recovery procedure

### Rollback Plan
- [ ] Restore from backup command
- [ ] Remove new index structure
- [ ] Validate old index still works
- [ ] Test rollback procedure before migration

### Testing
- [ ] Test on production data copy (devsteps repo)
- [ ] Test with empty index
- [ ] Test with 1000+ items (stress test)
- [ ] Test with corrupted index (error handling)
- [ ] Test rollback scenario

### Documentation
- [ ] Migration guide for users
- [ ] Troubleshooting section
- [ ] FAQ for common issues
- [ ] Rollback instructions

### Git Workflow
- [ ] Document .gitignore changes (if any)
- [ ] Update .github/instructions for new index
- [ ] Commit message template update

## Technical Notes

**Migration Command:**
```bash
npm run migrate:index
# or
node scripts/migrate-index.js
```

**Safety Checks:**
```typescript
// Pre-flight checks
assert(oldIndexExists, 'Old index.json not found');
assert(newIndexNotExists, 'New index already exists - aborting');
assert(validSchema(oldIndex), 'Invalid old index schema');

// Post-migration validation
assert(itemCount(old) === itemCount(new), 'Item count mismatch');
assert(allIdsPresent(old, new), 'Missing items detected');
```

**Index File Format:**
```json
{
  "type": "tasks",
  "items": ["TASK-160", "TASK-161", "TASK-162"],
  "migrated": "2025-12-13T13:30:00.000Z",
  "source": "index.json",
  "version": "1.0.0"
}
```

## Affected Paths
- `scripts/migrate-index.ts` (new)
- `.devsteps/index.json` (archived after migration)
- `.devsteps/index/` (created during migration)

## Dependencies
- Depends on: STORY-070 (All packages support new index)
- Blocks: STORY-072 (Validation needs migrated data)

## Success Metrics
- Migration completes in <5 seconds
- Zero data loss (100% items migrated)
- Zero downtime for users
- Rollback works if needed

## Definition of Done
- Migration script tested on production data
- Backup and rollback procedures verified
- Documentation complete
- Migration executed successfully
- Old index.json archived
- All items accessible via new index
- Team trained on new structure