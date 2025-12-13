# CLI Command: Rebuild Index

## Purpose
Provide official CLI command to rebuild `index.json` from individual work item JSON files when index becomes corrupted or outdated.

## Background
After refactoring to minimal index (without `linked_items`), we need a reliable way to rebuild the index from source of truth (individual JSON files).

## Implementation Options

### Option 1: `devsteps doctor --fix`
Extend existing `doctor` command with `--fix` flag to auto-repair index.

### Option 2: `devsteps rebuild-index`
New dedicated command for index maintenance.

### Option 3: Automatic on add/update
Make `add` and `update` commands rebuild index incrementally (safest, no manual intervention needed).

## Index Structure (Minimal)
```json
{
  "version": "1.0.0",
  "counters": { "epic": 4, "task": 31, ... },
  "items": [
    { "id", "type", "title", "status", "priority", "created", "updated" }
  ],
  "stats": { "total": 47, "by_type": {...}, "by_status": {...} },
  "archived_items": [],
  "last_updated": "ISO timestamp"
}
```

**NO `linked_items` in index** - keeps index lightweight for fast lists.

## Recommendation
**Option 3** - Make add/update commands maintain index automatically. Users shouldn't need to think about index consistency.

## Acceptance Criteria
- [ ] Index rebuilt from all item JSON files
- [ ] Counters calculated correctly (max ID per type)
- [ ] Stats accurate (by_type, by_status)
- [ ] NO linked_items included (minimal index)
- [ ] Command completes in <1s for 1000 items
