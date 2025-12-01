# Doctor: Detect Dependency Cycles (Warning Only)

## Problem
Tasks/items can form **dependency deadlocks**:
```json
TASK-001 { "depends-on": ["TASK-002"] }
TASK-002 { "depends-on": ["TASK-001"] }
```

This indicates a planning error but should **NOT be blocked** at link creation (user might fix later).

## Solution
Add **warning detection** in `devsteps doctor` to identify circular dependencies.

### When This Is Legitimate
```json
// Multi-step refactoring might temporarily create cycles
TASK-001: "Extract function A" → depends-on → TASK-002
TASK-002: "Update callers" → depends-on → TASK-001
// Resolved by breaking into subtasks or reordering
```

### When This Is Problematic
```json
// True deadlock - neither can proceed
SPIKE-001: "Research architecture" → required-by → STORY-004
STORY-004: "Implement feature" → depends-on → SPIKE-001
// Indicates planning confusion
```

## Implementation

### Detection Algorithm
**File**: `packages/cli/src/commands/doctor.ts`

```typescript
interface DependencyCycle {
  items: string[];
  relationType: 'depends-on' | 'required-by' | 'blocks';
}

async function detectDependencyCycles(
  devstepsDir: string
): Promise<DependencyCycle[]> {
  const cycles: DependencyCycle[] = [];
  const allItems = await loadAllItems(devstepsDir);
  const itemsById = new Map(allItems.map(item => [item.id, item]));
  
  // Check depends-on relationships
  for (const item of allItems) {
    const visited = new Set<string>();
    const path: string[] = [];
    
    function detectCycle(currentId: string): boolean {
      if (visited.has(currentId)) {
        // Found cycle - extract it from path
        const cycleStart = path.indexOf(currentId);
        if (cycleStart !== -1) {
          cycles.push({
            items: path.slice(cycleStart),
            relationType: 'depends-on'
          });
          return true;
        }
      }
      
      visited.add(currentId);
      path.push(currentId);
      
      const currentItem = itemsById.get(currentId);
      if (currentItem) {
        for (const depId of currentItem.linked_items['depends-on']) {
          if (detectCycle(depId)) return true;
        }
      }
      
      path.pop();
      return false;
    }
    
    detectCycle(item.id);
  }
  
  // Deduplicate cycles (same cycle detected from different entry points)
  return deduplicateCycles(cycles);
}

function deduplicateCycles(cycles: DependencyCycle[]): DependencyCycle[] {
  const seen = new Set<string>();
  return cycles.filter(cycle => {
    const sorted = [...cycle.items].sort().join(',');
    if (seen.has(sorted)) return false;
    seen.add(sorted);
    return true;
  });
}
```

### Output Format
```bash
$ devsteps doctor

🏥 DevSteps Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Environment checks passed
✓ Relationship integrity checks passed

━━━ Dependency Analysis ━━━

⚠ Circular dependency detected (2 items)
  TASK-001 → depends-on → TASK-002
  TASK-002 → depends-on → TASK-001
  
  Impact: Neither task can start (deadlock)
  Suggestion: Break cycle by:
    1. Remove one dependency, OR
    2. Add intermediate task, OR
    3. Mark one as "draft" until other completes

⚠ Circular dependency detected (3 items)  
  SPIKE-001 → required-by → STORY-004
  STORY-004 → depends-on → TASK-010
  TASK-010 → depends-on → SPIKE-001
  
  Impact: Complex dependency chain blocks work
  Suggestion: Review planning - consider splitting STORY-004

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: 0 errors, 2 warnings
```

## Severity Levels

| Cycle Type | Severity | Rationale |
|------------|----------|-----------|
| 2-item `depends-on` cycle | ⚠️ Warning | Common in refactoring, easily fixable |
| 3+ item cycle | ⚠️ Warning | Complex but might be intentional |
| `blocks` cycle | ⚠️ Warning | Indicates planning issue |
| `required-by` cycle | ⚠️ Warning | Research dependencies |

**No errors** - all cycles are warnings (not data corruption).

## Visualization (Future Enhancement)
```bash
devsteps doctor --visualize-cycles

     ┌──────────┐
     │ TASK-001 │
     └────┬─────┘
          │ depends-on
          ▼
     ┌──────────┐
     │ TASK-002 │
     └────┬─────┘
          │ depends-on
          │
          └──────────┐
                     │
                     ▼
                ┌──────────┐
                │ TASK-001 │ ◄─── CYCLE!
                └──────────┘
```

## Acceptance Criteria
- [ ] Detects 2-item dependency cycles
- [ ] Detects 3+ item dependency cycles  
- [ ] Deduplicates identical cycles
- [ ] Reports as ⚠️ warnings (not errors)
- [ ] Shows full cycle path
- [ ] Provides actionable suggestions
- [ ] Tests for various cycle patterns
- [ ] Performance: <1s for 1000 items

## Non-Goals
- ❌ Auto-fix cycles (requires human decision)
- ❌ Block cycle creation (prevents legitimate use)
- ❌ Detect semantic conflicts (e.g., circular logic in descriptions)

## Testing

```typescript
// Test case 1: Simple 2-item cycle
TASK-001.depends-on = ["TASK-002"]
TASK-002.depends-on = ["TASK-001"]
expect(cycles).toHaveLength(1);

// Test case 2: 3-item cycle
TASK-A.depends-on = ["TASK-B"]
TASK-B.depends-on = ["TASK-C"]  
TASK-C.depends-on = ["TASK-A"]
expect(cycles).toHaveLength(1);
expect(cycles[0].items).toEqual(["TASK-A", "TASK-B", "TASK-C"]);

// Test case 3: No cycle
TASK-001.depends-on = ["TASK-002"]
TASK-002.depends-on = [] // Linear dependency
expect(cycles).toHaveLength(0);
```

## Related
- TASK-097: Prevents conflicting relation types (hard block)
- STORY-006: Doctor command comprehensive validation
- TASK-044: Invalid relationship detection
