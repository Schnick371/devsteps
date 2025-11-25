# Story: Index Consistency & Repair

## User Value
**As a** DevSteps user,  
**I want** doctor to validate and repair index files,  
**so that** my workspace remains consistent even after file operations.

## Problem
Index files (`.devsteps/index.json`, type-specific indexes) can become stale or corrupted:
- Item deleted but still in index
- Item created but missing from index
- Duplicate entries
- Wrong category counts

This leads to incorrect `devsteps list` results and status reports.

## Implementation Approach

### 1. **Index Validation**
```typescript
async function checkIndexConsistency() {
  const issues: IntegrityIssue[] = [];
  
  // Load physical files
  const allItems = await loadAllItems('.devsteps');
  const physicalIds = new Set(allItems.map(i => i.id));
  
  // Load indexes
  const mainIndex = await loadIndex('.devsteps/index.json');
  const indexedIds = new Set(mainIndex.items.map(i => i.id));
  
  // Find mismatches
  const orphanedInIndex = [...indexedIds].filter(id => !physicalIds.has(id));
  const missingInIndex = [...physicalIds].filter(id => !indexedIds.has(id));
  
  // Check type-specific indexes
  for (const type of ITEM_TYPES) {
    const typeIndex = await loadIndex(`.devsteps/${type}s/index.json`);
    // Validate counts, duplicates, consistency
  }
  
  return issues;
}
```

### 2. **Auto-Repair**
```bash
devsteps doctor --fix
# Rebuilds all indexes from physical files
```

## Checks to Implement
- ✅ Items in index but files deleted
- ✅ Files exist but missing from index
- ✅ Duplicate index entries
- ✅ Category count mismatches
- ✅ Type-specific index consistency

## Acceptance Criteria
- ✅ Detects all index inconsistencies
- ✅ Reports as error (affects core functionality)
- ✅ --fix flag rebuilds indexes from source of truth (files)
- ✅ Preserves index metadata (last_updated)
- ✅ Atomic rebuild (backup before replacing)
