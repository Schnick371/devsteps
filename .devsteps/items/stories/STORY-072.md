# Validation: Conflict Testing & Performance Benchmarking

## User Story
As a **DevSteps team**, I want **proof that refs-style index eliminates merge conflicts** so that **we can confidently adopt the new architecture**.

## Background
After migration (STORY-071), validate that the new index structure achieves the primary goal: eliminate merge conflicts during parallel development.

## Acceptance Criteria

### Parallel Branch Conflict Testing
- [ ] Create 3 parallel feature branches
- [ ] Branch A: Create new TASK-001 (updates by-type/tasks.json)
- [ ] Branch B: Update EPIC-018 status to in-progress (updates by-status/in-progress.json)
- [ ] Branch C: Create new STORY-072 (updates by-type/stories.json)
- [ ] Merge all three to main sequentially
- [ ] **Expected**: Zero or minimal conflicts
- [ ] **Compare**: Same test with old index.json (baseline)

### Conflict Scenarios Testing
- [ ] Scenario 1: Two branches create tasks (same index file)
- [ ] Scenario 2: Two branches update same item status (different files)
- [ ] Scenario 3: Create + delete same type (edge case)
- [ ] Scenario 4: Large batch operations (50+ items)
- [ ] Document conflict resolution steps if any occur

### Performance Benchmarking
- [ ] Baseline: Load time with old index.json
- [ ] New: Load time with refs-style index
- [ ] Compare: CLI `list` command speed
- [ ] Compare: MCP `list` tool speed
- [ ] Compare: Extension TreeView load time
- [ ] Document results in table format

### Load Testing
- [ ] Generate test dataset: 1000 items
- [ ] Generate test dataset: 5000 items
- [ ] Generate test dataset: 10,000 items
- [ ] Measure performance at each scale
- [ ] Identify performance bottlenecks if any

### Git Workflow Validation
- [ ] Test squash merge workflow
- [ ] Test rebase workflow
- [ ] Test merge commit workflow
- [ ] Verify index consistency after each

### Metrics Collection
- [ ] Merge conflict count: Before vs After
- [ ] Conflict resolution time: Before vs After
- [ ] Index load time: Before vs After
- [ ] Memory usage: Before vs After
- [ ] File count: Before vs After

### Documentation
- [ ] Create performance comparison report
- [ ] Document test scenarios and results
- [ ] Update README with new architecture benefits
- [ ] Create migration success announcement

## Technical Notes

**Test Matrix:**
```
| Scenario              | Old Index | New Index | Improvement |
|-----------------------|-----------|-----------|-------------|
| Parallel merges (3)   | 2 conflicts | 0 conflicts | 100%     |
| Status update         | Conflict  | No conflict | ✅       |
| Load time (290 items) | 50ms      | 45ms      | 10%       |
| Memory (290 items)    | 2.1MB     | 1.8MB     | 14%       |
```

**Conflict Test Script:**
```bash
#!/bin/bash
# Create parallel branches
git checkout -b test/branch-a main
# Make changes...
git commit -am "test: branch A changes"

git checkout -b test/branch-b main
# Make changes...
git commit -am "test: branch B changes"

# Merge sequentially
git checkout main
git merge test/branch-a  # Should succeed
git merge test/branch-b  # Count conflicts
```

## Success Criteria
- **Primary Goal**: ≥80% reduction in merge conflicts
- **Performance**: No regression (±10% acceptable)
- **Scalability**: Works with 10,000+ items
- **Reliability**: Zero data loss in all scenarios

## Affected Paths
- Test scripts in `scripts/test-index-conflicts.sh`
- Performance benchmarks in `docs/performance/`

## Dependencies
- Depends on: STORY-071 (Migration complete)

## Definition of Done
- All test scenarios executed
- Results documented
- Performance meets targets
- Team review and approval
- Success metrics achieved
- Announcement prepared