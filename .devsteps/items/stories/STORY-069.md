# Foundation: Refs-Style Index Schema & Core Operations

## User Story
As a **DevSteps developer**, I want **core index read/write operations using refs-style structure** so that **I can build on a solid foundation for the new index architecture**.

## Background
Current monolithic `index.json` will be replaced with distributed index files:
- `index/by-type/*.json` - Type-based categorization
- `index/by-status/*.json` - Status-based filtering
- `index/by-priority/*.json` - Priority-based queries

This story establishes the foundation in the `shared` package.

## Acceptance Criteria

### Schema Design
- [ ] Define TypeScript interfaces for new index structure
- [ ] Document index file naming conventions
- [ ] Specify ID array format per index file
- [ ] Define consistency rules across index files

### Directory Structure
- [ ] Create `.devsteps/index/` directory structure
- [ ] Create subdirectories: `by-type/`, `by-status/`, `by-priority/`
- [ ] Add `.gitkeep` or initial empty JSON files

### Core Read Operations
- [ ] `loadIndexByType(type)` - Load single type index
- [ ] `loadIndexByStatus(status)` - Load single status index
- [ ] `loadIndexByPriority(priority)` - Load single priority index
- [ ] `loadAllIndexes()` - Load complete index set
- [ ] Handle missing index files gracefully

### Core Write Operations
- [ ] `updateIndexByType(type, ids)` - Update type index
- [ ] `updateIndexByStatus(status, ids)` - Update status index
- [ ] `updateIndexByPriority(priority, ids)` - Update priority index
- [ ] Atomic write operations (prevent partial updates)
- [ ] Concurrent write safety

### Index Synchronization
- [ ] `addItemToIndex(item)` - Add item to all relevant indexes
- [ ] `removeItemFromIndex(itemId)` - Remove from all indexes
- [ ] `updateItemInIndex(item, changes)` - Update when item changes
- [ ] Ensure consistency across all index files

### Backward Compatibility
- [ ] Legacy `loadIndex()` function still works
- [ ] Fallback to old index.json if new structure missing
- [ ] Migration detection logic

### Testing
- [ ] Unit tests for all read operations
- [ ] Unit tests for all write operations
- [ ] Unit tests for concurrent writes
- [ ] Unit tests for error handling
- [ ] Test with empty indexes
- [ ] Test with large datasets (1000+ items)

## Technical Notes

**File Format:**
```json
{
  "type": "tasks",
  "items": ["TASK-160", "TASK-161", "TASK-162"],
  "updated": "2025-12-13T13:30:00.000Z"
}
```

**Consistency Rule:**
Every item MUST appear in:
- Exactly one `by-type/*.json` file
- Exactly one `by-status/*.json` file
- Exactly one `by-priority/*.json` file

**Performance Target:**
- Load single index: <10ms
- Update single index: <20ms
- Full index load: <100ms (290 items)

## Affected Paths
- `packages/shared/src/core/index-operations.ts` (new)
- `packages/shared/src/types/index.ts` (update interfaces)
- `packages/shared/src/schemas/index.ts` (new schemas)

## Dependencies
- None (foundation story)

## Definition of Done
- All acceptance criteria met
- Unit tests passing (100% coverage for new code)
- TypeScript builds without errors
- Documentation in code comments
- README updated with new index structure