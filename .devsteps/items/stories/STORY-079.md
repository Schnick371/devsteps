**Context:**
SPIKE-008 recommended git-inspired object store with `.devsteps/items/` subdirectory structure, but STORY-069-072 only implemented `index/` directory.

**Current State:**
```
.devsteps/
  epics/          # Flat structure
  stories/        # Flat structure
  tasks/          # Flat structure
  index/          # ✅ Implemented
    by-type/
    by-status/
    by-priority/
    counters.json
```

**Target State (from SPIKE-008):**
```
.devsteps/
  items/          # NEW: Git-style object store
    epics/
    stories/
    tasks/
    bugs/
    spikes/
    tests/
    requirements/
    features/
  index/          # Already implemented
    by-type/
    by-status/
    by-priority/
    counters.json
```

**Requirements:**
1. Create `.devsteps/items/` directory structure
2. Move all item files from flat dirs to `items/` subdirs
3. Update TYPE_TO_DIRECTORY constants
4. Update all file I/O operations
5. Update auto-migration to handle old structure
6. Maintain backward compatibility during transition
7. Update tests
8. Update documentation

**Acceptance Criteria:**
- ✅ All items accessible in new structure
- ✅ Migration preserves all data and relationships
- ✅ Tests pass
- ✅ Documentation updated
- ✅ Backward compatibility for projects not migrated yet

**Linked Items:**
- Implements: EPIC-018 (Git-Inspired Object Store)
- Relates-to: SPIKE-008 (research phase)