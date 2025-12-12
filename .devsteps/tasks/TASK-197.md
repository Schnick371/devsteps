# Add ULID Validation Checks to Doctor Command

## Context

**EPIC-018** introduces ULID-based identification system with conflict resolution. Doctor command needs new health checks to validate:
- ULID presence and format
- Migration completeness
- Conflict resolution integrity
- Schema consistency

## Goal

Extend `doctor.ts` with ULID-specific validation to catch data integrity issues early.

## Implementation

### New Check Functions

#### 1. `checkULIDPresence()` - Migration Validation
```typescript
/**
 * Check if all items have ULID field
 */
function checkULIDPresence(): CheckResult {
  const index = loadIndex();
  const items = loadAllItems();
  
  const missing = items.filter(item => !item.ulid);
  
  if (missing.length === 0) {
    return {
      name: 'ULID Migration',
      status: 'pass',
      message: `All ${items.length} items have ULID`
    };
  }
  
  if (missing.length === items.length) {
    return {
      name: 'ULID Migration',
      status: 'warn',
      message: 'No items migrated yet (pre-ULID project)',
      fix: 'Run: devsteps migrate ulid'
    };
  }
  
  return {
    name: 'ULID Migration',
    status: 'fail',
    message: `${missing.length}/${items.length} items missing ULID`,
    fix: 'Run: devsteps migrate ulid --force'
  };
}
```

#### 2. `checkULIDFormat()` - Format Validation
```typescript
/**
 * Check ULID format correctness
 */
function checkULIDFormat(): CheckResult {
  const items = loadAllItems().filter(item => item.ulid);
  
  const ULID_REGEX = /^[0-9A-Z]{26}$/; // Base32, 26 chars
  const invalid = items.filter(item => !ULID_REGEX.test(item.ulid));
  
  if (invalid.length === 0) {
    return {
      name: 'ULID Format',
      status: 'pass',
      message: `All ${items.length} ULIDs valid`
    };
  }
  
  return {
    name: 'ULID Format',
    status: 'fail',
    message: `${invalid.length} invalid ULIDs (wrong format)`,
    fix: `Invalid IDs: ${invalid.slice(0, 3).map(i => i.id).join(', ')}`
  };
}
```

#### 3. `checkULIDUniqueness()` - Collision Detection
```typescript
/**
 * Check for ULID collisions (should never happen)
 */
function checkULIDUniqueness(): CheckResult {
  const items = loadAllItems().filter(item => item.ulid);
  const uidMap = new Map<string, string[]>();
  
  for (const item of items) {
    const ids = uidMap.get(item.ulid) || [];
    ids.push(item.id);
    uidMap.set(item.ulid, ids);
  }
  
  const collisions = Array.from(uidMap.entries())
    .filter(([_, ids]) => ids.length > 1);
  
  if (collisions.length === 0) {
    return {
      name: 'ULID Uniqueness',
      status: 'pass',
      message: `All ${items.length} ULIDs unique`
    };
  }
  
  return {
    name: 'ULID Uniqueness',
    status: 'fail',
    message: `${collisions.length} ULID collisions detected!`,
    fix: `Collisions: ${collisions.map(([ulid, ids]) => ids.join('=')).join(', ')}`
  };
}
```

#### 4. `checkTimestampConsistency()` - LWW Validation
```typescript
/**
 * Check timestamp consistency for LWW conflict resolution
 */
function checkTimestampConsistency(): CheckResult {
  const items = loadAllItems();
  
  const invalid = items.filter(item => {
    if (!item.modified || !item.created) return true;
    return new Date(item.modified) < new Date(item.created);
  });
  
  if (invalid.length === 0) {
    return {
      name: 'Timestamp Consistency',
      status: 'pass',
      message: `All ${items.length} items have valid timestamps`
    };
  }
  
  return {
    name: 'Timestamp Consistency',
    status: 'fail',
    message: `${invalid.length} items: modified < created (time travel!)`,
    fix: `Run: devsteps doctor --fix-timestamps`
  };
}
```

#### 5. `checkVersionCounters()` - Conflict Resolution Integrity
```typescript
/**
 * Check version counter monotonicity
 */
function checkVersionCounters(): CheckResult {
  const items = loadAllItems().filter(item => item.version);
  
  const invalid = items.filter(item => 
    typeof item.version !== 'number' || item.version < 1
  );
  
  if (items.length === 0) {
    return {
      name: 'Version Counters',
      status: 'warn',
      message: 'No version counters found (pre-ULID project)'
    };
  }
  
  if (invalid.length === 0) {
    return {
      name: 'Version Counters',
      status: 'pass',
      message: `All ${items.length} items have valid version`
    };
  }
  
  return {
    name: 'Version Counters',
    status: 'fail',
    message: `${invalid.length} items with invalid version`,
    fix: 'Run: devsteps migrate ulid --fix-versions'
  };
}
```

### Integration into doctorCommand()

```typescript
export async function doctorCommand() {
  // ... existing code ...
  
  const checks: CheckResult[] = [
    checkNode(),
    checkPackageManager(),
    checkGit(),
    checkTypeScript(),
    checkDependencies(),
    checkDevStepsProject(),
    checkMCPConfig(),
    
    // NEW: ULID Health Checks
    checkULIDPresence(),
    checkULIDFormat(),
    checkULIDUniqueness(),
    checkTimestampConsistency(),
    checkVersionCounters(),
  ];
  
  // ... rest of existing code ...
}
```

## Acceptance Criteria

- ✅ Add 5 new ULID-specific check functions
- ✅ Integrate checks into doctorCommand()
- ✅ Pass/Warn/Fail logic for each check
- ✅ Actionable fix messages (migration commands)
- ✅ Handle pre-ULID projects gracefully (warnings, not failures)
- ✅ Detect format errors, collisions, timestamp issues
- ✅ Tests for each check function

## Test Cases

```typescript
// Test 1: Pre-ULID project (all items missing ULID)
// Expected: WARN with "devsteps migrate ulid" fix

// Test 2: Partial migration (some items have ULID)
// Expected: FAIL with "--force" migration suggestion

// Test 3: Complete migration (all items have ULID)
// Expected: PASS

// Test 4: Invalid ULID format (lowercase, wrong length)
// Expected: FAIL with list of invalid IDs

// Test 5: ULID collision (duplicate ULIDs)
// Expected: FAIL with collision details

// Test 6: Time travel (modified < created)
// Expected: FAIL with "--fix-timestamps" suggestion

// Test 7: Invalid version counter (negative, non-integer)
// Expected: FAIL with migration fix
```

## Dependencies

- **Depends on:** TASK-192 (schema defines ULID fields)
- **Depends on:** TASK-195 (migration script to test against)
- **Tested by:** Unit tests for each check function

## Affected Files

- `packages/cli/src/commands/doctor.ts` - Add 5 new check functions
- `packages/cli/src/commands/doctor.test.ts` - New tests (create if not exists)
- `packages/shared/src/utils/load-items.ts` - May need helper function

## Notes

**Why Doctor is critical for ULID:**
- ULID errors break conflict resolution
- Invalid ULIDs cause git merge failures
- Timestamp bugs create infinite conflict loops
- Early detection prevents data corruption

**Error Impact Analysis:**
- Missing ULID → Git merge conflicts
- Invalid format → Parsing errors
- Duplicate ULID → LWW resolution fails
- Timestamp inconsistency → Wrong winner in conflict
- Invalid version → Broken optimistic locking