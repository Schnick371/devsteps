# Index Architecture Refactoring - Git-Inspired Refs Model

## Vision
Eliminate `.devsteps/index.json` merge conflicts by adopting Git's proven refs-based architecture while preserving human-readable IDs and existing item files.

## Problem
Current monolithic `index.json` (2134 lines, 290 items, array-based) causes frequent merge conflicts during parallel development:
- Feature branches update work item status → conflicts with main during squash merge
- Array structure requires multi-line changes for single item updates
- Manual conflict resolution (`git checkout --theirs`) required repeatedly
- Blocks efficient parallel feature development

## Solution: Refs-Style Index Structure

Transform from monolithic array to distributed index files modeled after `.git/refs/`:

**Current (Problematic):**
```
.devsteps/
└── index.json          # 2134 lines, array-based, conflict-prone
```

**Target (Git-Inspired):**
```
.devsteps/
├── items/              # Unchanged! Human-readable files preserved
│   ├── epics/EPIC-001.json, EPIC-001.md
│   ├── tasks/TASK-160.json, TASK-160.md
│   └── ...
└── index/              # NEW: Distributed refs-style index
    ├── by-type/
    │   ├── epics.json     # ["EPIC-001", "EPIC-017", ...]
    │   ├── stories.json   # Small files (~20-50 IDs)
    │   └── tasks.json
    ├── by-status/
    │   ├── draft.json
    │   ├── in-progress.json
    │   └── done.json
    └── by-priority/
        ├── critical.json
        └── high.json
```

## Business Value

**Development Velocity:**
- Reduce merge conflict time by ~80% (estimated)
- Enable true parallel feature development
- Faster code reviews (no index conflict noise)
- Cleaner git history

**Maintainability:**
- Battle-tested architecture (Git, 20+ years)
- Scales to 866k+ items (proven in Android repo)
- Easier debugging (small, focused index files)
- Future-proof for growth

**Developer Experience:**
- No more `git checkout --theirs .devsteps/index.json`
- Predictable merge behavior
- Transparent conflict resolution when they occur

## Success Criteria

1. **Zero index conflicts** in parallel feature branch merges
2. **100% backward compatible** - existing items unchanged
3. **Performance maintained** or improved (load time, query speed)
4. **Migration path** documented and tested
5. **All packages updated** (shared, cli, mcp-server, extension)

## Scope

**In Scope:**
- Index structure refactoring (by-type, by-status, by-priority)
- Core I/O operations update (read/write/update index)
- Migration script for existing index.json
- Comprehensive tests for new index structure
- Documentation updates

**Out of Scope:**
- Item file format changes (stays .json + .md)
- ID format changes (stays TASK-xxx, EPIC-xxx)
- Hash-based object store (overkill for our use-case)
- Append-only event log (different use-case)

## Technical Approach

**Phase 1: Foundation (STORY-1)**
- Design new index schema
- Create index directory structure
- Implement core read/write operations in shared package

**Phase 2: Integration (STORY-2)**
- Update CLI to use new index
- Update MCP server to use new index
- Update extension to use new index

**Phase 3: Migration (STORY-3)**
- Build migration script (index.json → index/*)
- Test migration with production data copy
- Rollback strategy if needed

**Phase 4: Validation (STORY-4)**
- Parallel branch conflict testing
- Performance benchmarking
- Documentation and rollout

## Dependencies

**Relates to:**
- EPIC-017: Simplify Priority System (both data structure improvements)
- EPIC-012: Shared Core Consistency (affects shared package)

**Depends on:**
- SPIKE-008: Research complete ✅

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Migration data loss | High | Comprehensive tests, backup strategy, rollback plan |
| Performance regression | Medium | Benchmarking before/after, optimization if needed |
| Breaking changes | High | 100% backward compatible requirement, feature flags |
| Adoption resistance | Low | Gradual rollout, clear benefits communication |

## Timeline Estimate

- **SPIKE-008**: Complete ✅
- **STORY-1** (Foundation): 3-4 tasks, ~1 week
- **STORY-2** (Integration): 3 tasks, ~1 week
- **STORY-3** (Migration): 2 tasks, ~3 days
- **STORY-4** (Validation): 2 tasks, ~2 days

**Total**: ~3 weeks (actual dev time)

## Research Foundation

Based on SPIKE-008 findings:
- 8 intensive research rounds
- 80+ authoritative sources
- Git internals, Azure, AWS best practices
- Industry patterns (Stripe, NIST OSCAL)

## Acceptance Criteria

- [ ] All parallel feature branch merges succeed without index conflicts
- [ ] Item files remain unchanged (.json, .md, human-readable IDs)
- [ ] All unit tests pass
- [ ] Integration tests cover new index operations
- [ ] Migration tested on production data copy
- [ ] Documentation complete and accurate
- [ ] Performance metrics equal or better than baseline