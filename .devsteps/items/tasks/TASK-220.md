## Objective

Comprehensive test coverage for relationship management: unit tests for `relationships.ts` module + integration tests for CLI/MCP workflows.

## Unit Tests (Vitest)

**File**: `packages/shared/src/core/__tests__/relationships.test.ts`

### Test Suites

**1. createLink() Tests**
- ✅ Creates bidirectional link (source + inverse)
- ✅ Validates item IDs (rejects invalid formats)
- ✅ Enforces methodology rules (Scrum: Epic→Story, Story→Task)
- ✅ Rejects invalid relationships (Task→Epic direct)
- ✅ Idempotent (duplicate link doesn't error)
- ✅ Updates timestamps on both items
- ✅ Returns success result with message
- ✅ Returns error result with suggestion

**2. removeLink() Tests**
- ✅ Removes bidirectional link atomically
- ✅ Idempotent (removing non-existent link succeeds)
- ✅ Updates timestamps only if links existed
- ✅ Returns success even if already unlinked
- ✅ Validates item IDs
- ✅ Resolves inverse relationship correctly
- ✅ Handles missing items gracefully

**3. getRelatedItems() Tests**
- ✅ Returns all related items for single type
- ✅ Returns multiple relationship types when array passed
- ✅ Returns empty array if no relationships
- ✅ Includes metadata (type, title) for each related item

**4. traverseRelationships() Tests**
- ✅ Depth 1: Direct children only
- ✅ Depth 2: Grandchildren included
- ✅ Circular dependency detection (prevents infinite loops)
- ✅ Filters by relationship type
- ✅ Returns hierarchical tree structure

## Integration Tests (BATS)

**File**: `tests/integration/cli/relationship-management.bats`

### Test Scenarios

```bash
@test "link then unlink workflow" {
  devsteps init test-project
  devsteps add story "User Authentication"
  devsteps add task "Create login form"
  
  # Link
  devsteps link STORY-001 implements TASK-001
  devsteps get STORY-001 | grep "TASK-001"
  devsteps get TASK-001 | grep "STORY-001"  # Inverse
  
  # Unlink
  devsteps unlink STORY-001 implements TASK-001
  devsteps get STORY-001 | grep -v "TASK-001"
  devsteps get TASK-001 | grep -v "STORY-001"
}

@test "unlink is idempotent" {
  devsteps unlink STORY-001 implements TASK-001
  devsteps unlink STORY-001 implements TASK-001  # Second call succeeds
}

@test "unlink preserves other relationships" {
  devsteps link STORY-001 relates-to STORY-002
  devsteps link STORY-001 implements TASK-001
  
  devsteps unlink STORY-001 implements TASK-001
  devsteps get STORY-001 | grep "STORY-002"  # Still linked
}
```

## Coverage Targets
- Unit tests: >90% coverage for relationships.ts
- Integration tests: Link/unlink workflows, error cases
- Performance: <100ms per operation (measured in tests)

## Acceptance Criteria
- [ ] Unit tests for createLink() (8+ test cases)
- [ ] Unit tests for removeLink() (7+ test cases)
- [ ] Unit tests for getRelatedItems() (4+ test cases)
- [ ] Unit tests for traverseRelationships() (4+ test cases)
- [ ] Integration tests for link→unlink workflow
- [ ] Integration tests for idempotency
- [ ] Integration tests for preserving other relationships
- [ ] All tests pass: `npm test`
- [ ] Coverage report shows >90% for relationships.ts
- [ ] BATS tests pass: `npm run test:cli`