# Research: Git-Inspired Index Architecture

## Mission
Investigate how to prevent `.devsteps/index.json` merge conflicts using Git's proven architecture patterns.

## Problem Statement
Current array-based `index.json` (2134 lines, 290 items) causes frequent merge conflicts during parallel development:
- Feature branches update work item status → conflicts with main
- Array structure changes many lines when items added/sorted
- Squash merges consistently require manual conflict resolution

## Research Approach
8 intensive research rounds covering:
1. Git internals & object storage
2. Human-readable vs hash-based IDs
3. Hybrid approaches (best of both worlds)
4. Immutable storage & append-only patterns
5. Content-addressable filesystem design
6. Git references (refs) architecture
7. Refs directory structure & implementation
8. Production best practices & lessons learned

## Key Findings

### 1. Git's Two-Layer Architecture

**Lower Layer: Object Store**
- Content-addressable storage via SHA-1/SHA-256
- `.git/objects/ab/cdef123...` (first 2 chars = dir, rest = filename)
- **Immutable**: Once stored, never changed
- **Deduplication**: Same content = same hash = stored once

**Upper Layer: References**
- Human-readable names: `refs/heads/main`, `refs/tags/v1.0`
- Simple text files containing SHA hash
- **Mutable**: Branches move, tags are static
- **No merge conflicts**: Each ref = separate file!

### 2. Why Git Has No Index Merge Conflicts

```
.git/refs/
├── heads/
│   ├── main          (file with hash)
│   ├── feature-a     (file with hash)
│   └── bugfix-123    (file with hash)
└── tags/
    ├── v1.0          (file with hash)
    └── v2.0          (file with hash)
```

**Each ref = own file** → Different branches change different files → No conflicts!

### 3. Human-Readable vs Hash-Based IDs

**Industry Consensus:**
- **Stripe, GitHub**: Prefix + Short ID (`pi_3LKQhv...`)
- **Hybrid URLs**: `/users/550e8400/john-doe` (UUID + slug)
- **NIST OSCAL Standard**: Both `id` (human) and `uuid` (system)

**Verdict**: Keep human-readable IDs (`TASK-160`), NOT replace with hashes!

### 4. Event Sourcing Patterns

**Append-only logs prevent conflicts via:**
- Each event = new line (no overwriting)
- Immutability = no deletion/modification
- Current state = aggregation of all events

**But**: Our use-case is queryable index, not event log.

### 5. Production Best Practices

From AWS, Microsoft, Git workflows:
- Small, frequent commits > large batches
- Trunk-based development > long-lived branches
- Pull often > rare merges
- Communication about parallel changes
- Never gitignore "source of truth" files (like package-lock.json)

## Recommended Solution: Refs-Style Index

**Inspired by `.git/refs/` architecture:**

```
.devsteps/
├── items/                     # Object Store (unchanged!)
│   ├── epics/
│   │   ├── EPIC-001.json     # Human-readable names!
│   │   └── EPIC-001.md
│   ├── tasks/
│   │   ├── TASK-160.json
│   │   └── TASK-160.md
│   └── ... (other types)
│
└── index/                     # References (NEW!)
    ├── by-type/              # Categorized refs
    │   ├── epics.json        # ["EPIC-001", "EPIC-017", ...]
    │   ├── stories.json      # ["STORY-042", "STORY-043", ...]
    │   └── tasks.json        # ["TASK-160", "TASK-161", ...]
    ├── by-status/
    │   ├── draft.json        # ["EPIC-017", "TASK-163", ...]
    │   ├── in-progress.json  # ["TASK-160"]
    │   └── done.json         # ["TASK-159", "STORY-041", ...]
    └── by-priority/
        ├── critical.json
        ├── high.json
        ├── medium.json
        └── low.json
```

## Why This Works

✅ **Drastically Reduced Merge Conflicts**
- `by-type/tasks.json` changes only when new tasks created
- `by-status/in-progress.json` changes only on status updates
- Feature branches usually modify different index files
- Small files (~20-50 IDs each) = minimal conflict surface

✅ **Human-Readable Preserved**
- IDs stay: `EPIC-001`, `TASK-160` (as before!)
- Files stay: `TASK-160.json`, `TASK-160.md` (as before!)
- No switch to cryptic hashes needed

✅ **Git-Proven Architecture**
- Same structure as `.git/refs/heads/`, `.git/refs/tags/`
- Battle-tested for 20 years in millions of repositories
- Scales to 866k refs (Android repository example)

✅ **Performance Benefits**
- Small files load fast
- Quick filtering: Load only relevant index file
- Parallel reads possible
- Reduced memory footprint

✅ **Backward Compatible**
- Items unchanged: `EPIC-001.json`, `EPIC-001.md`
- Migration: Change index structure, items untouched
- Gradual rollout possible

## Alternative Considered: Hash-Based Object Names

Git's full object store model:
```
.devsteps/
├── objects/
│   ├── a3/
│   │   └── 4f7e2... (hash of EPIC-001 content)
│   └── b7/
│       └── 9a3c1... (hash of TASK-160 content)
└── refs/
    ├── epics/
    │   └── EPIC-001 → "a34f7e2..."
```

**Verdict**: **Overkill** for our use-case!
- Git needs this for deduplication (same file contents)
- We never have identical work items
- Complexity without real benefit
- Human-readability lost in item files

## Research Sources

**8 Tavily searches with 80 authoritative sources:**
- Git internals documentation (git-scm.com)
- Princeton COS316 course materials
- GitHub Engineering blog
- Microsoft Azure Architecture Center
- AWS Prescriptive Guidance
- Industry best practices (Stripe, NIST OSCAL)
- Production lessons learned articles

## Next Steps

1. Create EPIC: Index Architecture Refactoring
2. Create Stories for implementation phases
3. Link to EPIC-017 (Simplify Priority System) - both data structure improvements
4. Design migration strategy
5. Implement refs-style index
6. Test with parallel feature branches
7. Measure merge conflict reduction

## Success Criteria

- Zero or minimal index.json merge conflicts during parallel development
- Human-readable IDs preserved (TASK-xxx format)
- Item files (.json, .md) remain unchanged
- Performance equal or better than current index
- Full backward compatibility maintained
- Migration path documented and tested